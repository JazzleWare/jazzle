this.parseExport = function() {
  if (this.v <= 5) this.err('ver.exim');

  if ( !this.canBeStatement && this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.canBeStatement = false;

  var startc = this.c0, startLoc = this.locBegin();
  this.next();

  var list = [], local = null, src = null ;
  var endI = 0;
  var ex = null;

  var semiLoc = null;
  switch ( this.lttype ) {
  case 'op':
    if (this.ltraw !== '*' &&
        this.err('export.all.not.*',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;
 
    this.next();
    if ( !this.expectID_soft('from') &&
          this.err('export.all.no.from',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;

    if (!(this.lttype === 'Literal' &&
         typeof this.ltval === STRING_TYPE ) && 
         this.err('export.all.source.not.str',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput;

    src = this.numstr();
    
    endI = this.semiI();
    semiLoc = this.semiLoc_soft();
    if ( !semiLoc && !this.newlineBeforeLookAhead &&
         this.err('no.semi') )
      return this.errorHandlerOutput;

    this.foundStatement = true;
    
    return  { type: 'ExportAllDeclaration',
               start: startc,
               loc: { start: startLoc, end: semiLoc || src.loc.end },
                end: endI || src.end,
               source: src };

   case '{':
     this.next();
     var firstReserved = null;

     while ( this.lttype === 'Identifier' ) {
       local = this.id();
       if ( !firstReserved ) {
         this.throwReserved = false;
         this.validateID(local.name);
         if ( this.throwReserved )
           firstReserved = local;
         else
           this.throwReserved = true;
       }
       ex = local;
       if ( this.lttype === 'Identifier' ) {
         if ( this.ltval !== 'as' && 
              this.err('export.specifier.not.as',{extra:[startc,startLoc,local,list]}) )
           return this.errorHandlerOutput ;

         this.next();
         if ( this.lttype !== 'Identifier' ) { 
            if (  this.err('export.specifier.after.as.id',{extra:[startc,startLoc,local,list]}) )
           return this.errorHandlerOutput;
         }
         else
            ex = this.id();
       }
       list.push({ type: 'ExportSpecifier',
                  start: local.start,
                  loc: { start: local.loc.start, end: ex.loc.end }, 
                   end: ex.end, exported: ex,
                  local: local }) ;

       if ( this.lttype === ',' )
         this.next();
       else
         break;
     }

     endI = this.c;
     var li = this.li, col = this.col;
  
     if ( !this.expectType_soft('}') && 
           this.err('export.named.list.not.finished',{extra:[startc,startLoc,list,endI,li,col]}) )
       return this.errorHandlerOutput  ;

     if ( this.lttype === 'Identifier' ) {
       if ( this.ltval !== 'from' &&
            this.err('export.named.not.id.from',{extra:[startc,startLoc,list,endI,li,col]}) )
          return this.errorHandlerOutput;

       else this.next();
       if ( !( this.lttype === 'Literal' &&
              typeof this.ltval ===  STRING_TYPE) &&
            this.err('export.named.source.not.str', {extra:[startc,startloc,list,endI,li,col]}) )
         return this.errorHandlerOutput ;

       else {
          src = this.numstr();
          endI = src.end;
       }
     }
     else
        if (firstReserved && this.err('export.named.has.reserved',{tn:firstReserved,extra:[startc,startLoc,list,endI,li,col]}) )
          return this.errorHandlerOutput ;

     endI = this.semiI() || endI;
     semiLoc = this.semiLoc_soft();
     if ( !semiLoc && !this.nl &&
          this.err('no.semi'))
       return this.errorHandlerOutput; 

     this.foundStatement = true;
     return { type: 'ExportNamedDeclaration',
             start: startc,
             loc: { start: startLoc, end: semiLoc || ( src && src.loc.end ) ||
                                          { line: li, column: col } },
              end: endI, declaration: null,
               specifiers: list,
              source: src };

  }

  var context = CTX_NONE;

  if ( this.lttype === 'Identifier' && 
       this.ltval === 'default' ) {
    context = CTX_DEFAULT;
    if (this.onToken_ !== null)
      this.lttype = 'Keyword';
    this.next();
  }
  
  if ( this.lttype === 'Identifier' ) {
      switch ( this.ltval ) {
         case 'let':
         case 'const':
            if (context === CTX_DEFAULT && 
                this.err('export.default.const.let',{extra:[startc,startLoc]}) )
              return this.errorHandlerOutput;
                
            this.canBeStatement = true;
            ex = this.parseVariableDeclaration(CTX_NONE);
            break;
              
         case 'class':
            this.canBeStatement = true;
            ex = this.parseClass(context);
            break;
  
         case 'var':
            this.canBeStatement = true;
            ex = this.parseVariableDeclaration(CTX_NONE ) ;
            break ;

         case 'function':
            this.canBeStatement = true;
            ex = this.parseFunc( context, 0 );
            break ;

         case 'async':
           this.canBeStatement = true;
           if (context & CTX_DEFAULT) {
             ex = this.parseAsync(context);
             if (this.foundStatement)
               this.foundStatement = false;
             else {
               this.pendingExprHead = ex;
               ex = null;
             }
             break;
           }

           ex = this.parseAsync(context|CTX_ASYNC_NO_NEWLINE_FN);
           if (ex === null) {
             if (this.lttype === 'Identifier' && this.ltval === 'function') {
               ASSERT.call(this, this.nl, 'no newline before the "function" thing and still errors? -- impossible!');
               this.err('export.newline.before.the.function', {extra:[startc,startLoc]});
             } 
             else
               this.err('export.async.but.no.function',{extra:[startc,startLoc]});
           }
       }
  }

  if ( context !== CTX_DEFAULT ) {

    if (!ex && this.err('export.named.no.exports',{extra:[startc,startLoc]}) )
      return this.errorHandlerOutput ;
    
    this.foundStatement = true;
    return { type: 'ExportNamedDeclaration',
           start: startc,
           loc: { start: startLoc, end: ex.loc.end },
            end: ex.end , declaration: ex,
             specifiers: list ,
            source: null };
  }

  var endLoc = null;

  if ( ex === null ) {
    // TODO: this can exclusively happen as a result of calling `parseAsync` for parsing an async declaration;
    // eliminate
    if (this.canBeStatement)
      this.canBeStatement = false

    ex = this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT );
    endI = this.semiI();
    endLoc = this.semiLoc_soft(); // TODO: semiLoc rather than endLoc
    if ( !endLoc && !this.nl &&
         this.err('no.semi') )
      return this.errorHandlerOutput;
  }

  this.foundStatement = true;
  return { type: 'ExportDefaultDeclaration',    
          start: startc,
          loc: { start: startLoc, end: endLoc || ex.loc.end },
           end: endI || ex.end, declaration: core( ex ) };
}; 
