this . parseTemplateLiteral = function() {
  if (this.v <= 5)
    this.err('ver.temp');

  var li = this.li, col = this.col;
  var startc = this.c - 1, startLoc = this.locOn(1);
  var c = this.c, src = this.src, len = src.length;
  var templStr = [], templExpressions = [];
  
  // an element's content might get fragmented by an esc appearing in it,
  // e.g., 'eeeee\nee' has two fragments, 'eeeee' and 'ee'
  var startElemFragment = c; 

  var startElem = c,
      currentElemContents = "",
      startColIndex = c ,
      ch = 0, elem = null;
 
  while ( c < len ) {
    ch = src.charCodeAt(c);
    if ( ch === CH_BACKTICK ) break; 
    switch ( ch ) {
       case CH_$ :
          if ( src.charCodeAt(c+1) === CH_LCURLY ) {
              currentElemContents += src.slice(startElemFragment, c) ;
              this.col += ( c - startColIndex );
              elem =
                { type: 'TemplateElement', 
                 start: startElem, end: c, tail: false,
                 loc: { start: { line: li, column: col }, end: { line: this.li, column: this.col } },        
                 value: { raw : src.slice(startElem, c ).replace(/\r\n|\r/g,'\n'), 
                        cooked: currentElemContents   } };
              
              templStr.push(elem);

              if (this.onToken_ !== null) {
                var loc = elem.loc;
                this.onToken({
                  type:'Template', value: (templStr.length !== 1 ? '}' : '`') + elem.value.raw + '${',
                  start: elem.start - 1, end: elem.end + 2,
                  loc: {
                    start: { line: loc.start.line, column: loc.start.column - 1 },
                    end: { line: loc.end.line, column: loc.end.column + 2 }
                  }
                });
                this.lttype = "";
              }

              this.c = c + 2; // ${
              this.col += 2; // ${

              // this must be done manually because we must have                       
              // a lookahead before starting to parse an actual expression
              this.next(); 
                           
              templExpressions.push( core(this.parseExpr(CTX_NONE)) );
              if ( this. lttype !== '}')
                this.err('templ.expr.is.unfinished') ;

              currentElemContents = "";
              startElemFragment = startElem = c = this.c; // right after the '}'
              startColIndex = c;
              li = this.li;
              col = this.col;
          }

          else
             c++ ;

          continue;

       case CH_CARRIAGE_RETURN: 
           currentElemContents += src.slice(startElemFragment,c) + '\n' ;
           c++;
           if ( src.charCodeAt(c) === CH_LINE_FEED ) c++;
           startElemFragment = startColIndex = c;
           this.li++;
           this.col = 0;
           continue ;
 
       case CH_LINE_FEED:
           currentElemContents += src.slice(startElemFragment,c) + '\n';
           c++;
           startElemFragment = startColIndex = c;
           this.li++;
           this.col = 0;
           continue; 
 
       case 0x2028: case 0x2029:
           currentElemContents += src.slice(startElemFragment,c) + src.charAt(c);
           startColIndex = c;
           c++; 
           startElemFragment = c;
           this.li++;
           this.col = 0;           
           continue ;
 
       case CH_BACK_SLASH :
           this.c = c; 
           currentElemContents += src.slice( startElemFragment, c ) + this.readStrictEsc();
           c  = this.c;
           c++;
           if ( this.col === 0 ) // if we had an escaped newline 
             startColIndex = c;
           
           startElemFragment = c ;
           continue ;
    }

    c++ ;
  }
  
  if ( startElem < c ) {
     this.col += ( c - startColIndex );
     if ( startElemFragment < c )
       currentElemContents += src.slice( startElemFragment, c );
  }
  else currentElemContents = "";

  elem ={
     type: 'TemplateElement',
     start: startElem,
     loc: { start : { line: li, column: col }, end: { line: this.li, column: this.col } },
     end: startElem < c ? c : startElem ,
     tail: true,
     value: { raw: src.slice(startElem,c).replace(/\r\n|\r/g,'\n'), 
              cooked: currentElemContents }
  };

  templStr.push(elem);

  if (this.onToken_ !== null) {
    this.onToken({
      type:'Template', value: (templStr.length !== 1 ? '}' : '`')+elem.value.raw+'`',
      start: elem.start-1, end: elem.end+1,
      loc: {
        start: { line: elem.loc.start.line, column: elem.loc.start.column-1 },
        end: { line: elem.loc.end.line, column: elem.loc.end.column+1 }
      }    
    });
    this.lttype = "";
  }

  c++; // backtick  
  this.col ++ ;

  var n = { type: 'TemplateLiteral', start: startc, quasis: templStr, end: c,
       expressions: templExpressions , loc: { start: startLoc, end : this.loc() } /* ,y:-1*/};

  if ( ch !== CH_BACKTICK ) this.err('templ.lit.is.unfinished',{extra:n}) ;

  this.c = c;
  this.next(); // prepare the next token  

  return n
};

