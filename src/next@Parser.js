this.next = function () {
  if (this.onToken_ !== null) {
    switch (this.lttype) {
    case "eof":
    case "":
      break;
    default:
      this.onToken(null);
    }
  }

  if ( this.skipS() ) return;
  if (this.c >= this.src.length) {
      this. lttype =  'eof' ;
      this.ltraw=  '<<EOF>>';
      return ;
  }
  var c = this.c,
      l = this.src,
      e = l.length,
      r = 0,
      peek = -1,
      start =  c;

  this.c0 = c;
  this.col0 = this.col;
  this.li0 = this.li;

  peek  = this.src.charCodeAt(start);
  if ( isIDHead(peek) ) {
    if (this.directive !== DIR_NONE)
      this.directive = DIR_NONE;

    this.esct = ERR_NONE_YET;
    this.readAnIdentifierToken('');
  }
  else if (num(peek))this.readNumberLiteral(peek);
  else {

    switch (peek) {
      case CH_MIN: this.opMin(); break;
      case CH_ADD: this.opAdd() ; break;
      case CH_MULTI_QUOTE:
      case CH_SINGLE_QUOTE:
        return this.readStrLiteral(peek);
      case CH_SINGLEDOT: this.readDot () ; break ;
      case CH_EQUALITY_SIGN:  this.opEq () ;   break ;
      case CH_LESS_THAN: this.opLess() ;   break ;
      case CH_GREATER_THAN: this.opGrea() ;   break ;
      case CH_MUL:
         this.prec = PREC_MUL;
         this.lttype = 'op';
         this.ltraw = '*';
         c++ ;
         if ( l.charCodeAt(c) === peek) {
           if (this.v <= 5)
             this.err('ver.**');

           this.ltraw = '**';
           this.prec = PREC_EX;
           c++ ;
         }
         if (l.charCodeAt(c) === CH_EQUALITY_SIGN) {
           c++;
           this. prec = PREC_OP_ASSIG;
           this.ltraw += '=';
         }
         this.c=c;
         break ;

      case CH_MODULO:
         this.lttype = 'op';
         c++ ;
         if (l.charCodeAt(c) === CH_EQUALITY_SIGN) {
           c++;
           this. prec = PREC_OP_ASSIG;
           this.ltraw = '%=';
         }
         else {
           this. prec = PREC_MUL;
           this.ltraw = '%';
         }
         this.c=c;
         break ;

      case CH_EXCLAMATION:
         c++ ;
         if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
           this. lttype = 'op';
           c++;
           this.prec = PREC_EQUAL;
           if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
             this.ltraw = '!==';
             c++;
           }
           else this.ltraw = '!=' ;
         }
         else {
           this .lttype = 'u' ;
           this.ltraw = '!';
         }
         this.c=c;
         break ;

      case CH_COMPLEMENT:
            c++;
            this.c=c;
            this.ltraw = '~';
            this.lttype = 'u';
            break ;

      case CH_OR:
         c++;
         this.lttype = 'op' ;
         switch ( l.charCodeAt(c) ) {
            case CH_EQUALITY_SIGN:
                 c++;
                 this.prec = PREC_OP_ASSIG ;
                 this.ltraw = '|=';
                 break ;

            case CH_OR:
                 c++;
                 this.prec = PREC_BOOL_OR;
                 this.ltraw = '||'; break ;

            default:
                 this.prec = PREC_BIT_OR;
                 this.ltraw = '|';
                 break ;
         }
         this.c=c;
         break;

      case CH_AND:
          c++ ;
          this.lttype = 'op';
          switch ( l.charCodeAt(c) ) {
            case CH_EQUALITY_SIGN:
               c++;
               this. prec = PREC_OP_ASSIG;
               this.ltraw = '&=';
               break;

            case CH_AND:
               c ++;
               this.prec = PREC_BOOL_AND;
               this.ltraw = '&&';
               break ;

            default:
               this.prec = PREC_BIT_AND;
               this.ltraw = '&';
               break ;
         }
         this.c=c;
         break ;

      case CH_XOR:
        c++;
        this.lttype = 'op';
        if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
          c++;
          this.prec = PREC_OP_ASSIG;
          this.ltraw = '^=';
        }
        else  {
          this.  prec = PREC_XOR;
          this.ltraw = '^';
        }
        this.c=c  ;
        break;

      default:

        var mustBeAnID = 0 ;

        if (CH_BACK_SLASH === peek) {
          this.esct = ERR_PIN_UNICODE_IN_RESV;
          this.eloc.c0 = this.c;
          this.eloc.li0 = this.li;
          this.eloc.col0 = this.col;

          mustBeAnID = 1;
          peek = l.charCodeAt(++ this.c);
          if (peek !== CH_u )
              return this.err('id.u.not.after.slash');
          
          else
             peek = this.peekUSeq();

          if (peek >= 0x0D800 && peek <= 0x0DBFF )
            this.err('id.name.has.surrogate.pair');
        }
        if (peek >= 0x0D800 && peek <= 0x0DBFF ) {
            mustBeAnID = 2 ;
            this.c++;
            r = this.peekTheSecondByte();
        }
        if (mustBeAnID) {
          if (!isIDHead(mustBeAnID === 1 ? peek :
             ((peek - 0x0D800)<<10) + (r-0x0DC00) + (0x010000) ) ) {
            if ( mustBeAnID === 1 ) return this.err('id.esc.must.be.idhead',{extra:peek});
            else return this.err('id.multi.must.be.idhead',{extra:[peek,r]});
          }
 
          this.readAnIdentifierToken( mustBeAnID === 2 ?
              String.fromCharCode( peek, r ) :
              fromcode( peek )
          );
        }
        else 
          this.readMisc();
    }

    if (this.directive !== DIR_NONE)
      this.directive = DIR_NONE;
  }

  this.col += ( this.c - start );
};

this . opEq = function()  {
    var c = this.c;
    var l = this.src;
    this.lttype = 'op';
    c++ ;

    if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
      c++;
      this.prec = PREC_EQUAL ;
      if ( l.charCodeAt(c ) === CH_EQUALITY_SIGN ){
        c++ ;
        this.ltraw = '===';
      }
      else this.ltraw = '==';
    }
    else {
        this.prec = PREC_SIMP_ASSIG;
        if ( l.charCodeAt(c) === CH_GREATER_THAN) {
          c++;
          this. ltraw = '=>';
        }
        else  this.ltraw = '=' ;
    }

    this.c=c;
};

this . opMin = function() {
   var c = this.c;
   var l = this.src;
   c++;

   switch( l.charCodeAt(c) ) {
      case  CH_EQUALITY_SIGN:
         c++;
         this.prec = PREC_OP_ASSIG;
         this. lttype = 'op';
         this.ltraw = '-=';
         break ;

      case  CH_MIN:
         c++;
         this.prec = PREC_OO;
         this. lttype = this.ltraw = '--';
         break ;

      default:
         this.ltraw = this.lttype = '-';
         break ;
   }
   this.c=c;
};

this . opLess = function () {
  var c = this.c;
  var l = this.src;
  this.lttype = 'op';
  c++ ;

  if ( l.charCodeAt(c ) === CH_LESS_THAN ) {
     c++;
     if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
        c++;
        this. prec = PREC_OP_ASSIG ;
        this. ltraw = '<<=' ;
     }
     else {
        this.ltraw = '<<';
        this. prec = PREC_SH ;
     }
  }
  else  {
     this. prec = PREC_COMP ;
     if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
        c++ ;
        this.ltraw = '<=';
     }
     else this.ltraw = '<';
  }

  this.c=c;
};

this . opAdd = function() {
   var c = this.c;
   var l = this.src;
   c++ ;

   switch ( l.charCodeAt(c) ) {
       case CH_EQUALITY_SIGN:
         c ++ ;
         this. prec = PREC_OP_ASSIG;
         this. lttype = 'op';
         this.ltraw = '+=';

         break ;

       case CH_ADD:
         c++ ;
         this. prec = PREC_OO;
         this. lttype = '--';
         this.ltraw = '++';
         break ;

       default: this. ltraw = '+' ; this. lttype = '-';
   }
   this.c=c;
};

this . opGrea = function()   {
  var c = this.c;
  var l = this.src;
  this.lttype = 'op';
  c++ ;

  if ( l.charCodeAt(c) === CH_GREATER_THAN ) {
    c++;
    if ( l.charCodeAt(c) === CH_GREATER_THAN ) {
       c++;
       if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
         c++ ;
         this. prec = PREC_OP_ASSIG;
         this. ltraw = '>>>=';
       }
       else {
         this. ltraw = '>>>';
         this. prec = PREC_SH;
       }
    }
    else if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
       c++ ;
       this. prec = PREC_OP_ASSIG;
       this.ltraw = '>>=';
    }
    else {
       this. prec=  PREC_SH;
       this. ltraw    = '>>';
    }
  }
  else  {
    this. prec = PREC_COMP  ;
    if ( l.charCodeAt(c) === CH_EQUALITY_SIGN ) {
      c++ ;
      this. ltraw = '>=';
    }
    else  this. ltraw = '>';
  }
  this.c=c;
};

this.skipS = function() {
  var noNewLine = true,
      startOffset = this.c,
      c = this.c,
      l = this.src,
      e = l.length,
      start = c;

  while ( c < e ) {
    switch ( l.charCodeAt ( c ) ) {
    case CH_WHITESPACE :
      while ( ++c < e &&  l.charCodeAt(c) === CH_WHITESPACE );
      continue ;
    case CH_CARRIAGE_RETURN : if ( CH_LINE_FEED === l.charCodeAt( c + 1 ) ) c ++;
    case CH_LINE_FEED :
      if ( noNewLine ) noNewLine = false ;
      start = ++ c ;
      this.li ++ ;
      this.col = ( 0)
      continue ;

    case CH_VTAB:
    case CH_TAB:
    case CH_FORM_FEED: c++ ; continue ;  

    case CH_DIV:
      switch ( l.charCodeAt ( c + ( 1) ) ) {
      case CH_DIV:
        c += 2;
        this.col += (c-start) ;
        this.c=c;
        this.readLineComment () ;
        if (noNewLine) noNewLine = false ;
        start = c = this.c ;
        continue ;

      case CH_MUL:
        c += 2;
        this.col += (c-start) ;
        this.c = c ;
        noNewLine = this. readMultiComment () && noNewLine ;
        start = c = this.c ;
        continue ;

      default:
        this.c0 = c;
        this.col0 = this.col + (c-start);
        this.li0 = this.li;
        c++ ;
        this.nl = ! noNewLine ;
        this.col += (c-start) ;
        this.c=c ;
        this.prec  = 0xAD ;
        this.lttype =  '/';
        this.ltraw = '/' ;
        return true;
      }

    case 0x0020:case 0x00A0:case 0x1680:case 0x2000:
    case 0x2001:case 0x2002:case 0x2003:case 0x2004:
    case 0x2005:case 0x2006:case 0x2007:case 0x2008:
    case 0x2009:case 0x200A:case 0x202F:case 0x205F:
    case 0x3000:case 0xFEFF: c ++ ; continue ;

    case 0x2028:
    case 0x2029:
      if ( noNewLine ) noNewLine = false ;
      start = ++c ;
      this.col = 0 ;
      this.li ++ ;
      continue;

    case CH_LESS_THAN:
      if ( this.v > 5 && this.isScript &&
        l.charCodeAt(c+1) === CH_EXCLAMATION &&
        l.charCodeAt(c+2) === CH_MIN &&
        l.charCodeAt(c+1+2) === CH_MIN
      ) {
        this.c = c + 4;
        this.col += (this.c-start) ;
        this.readLineComment();
        c = this.c;
        continue;
      }
      this.col += (c-start ) ;
      this.c=c;
      this.nl = !noNewLine ;
      return ;
 
    case CH_MIN:
      if (this.v > 5 && (!noNewLine || startOffset === 0) &&
           this.isScript &&
           l.charCodeAt(c+1) === CH_MIN && l.charCodeAt(c+2) === CH_GREATER_THAN ) {
        this.c = c + 1 + 2;
        this.col += (this.c-start) ;
        this.readLineComment();
        c = this.c;
        continue;
      }
  
    default :
      this.col += (c-start ) ;
      this.c=c;
      this.nl = !noNewLine ;
      return ;
    }
  }

  this.col += (c-start ) ;
  this.c = c ;
  this.nl = !noNewLine ;
};

this.readDot = function() {
   ++this.c;
   if( this.src.charCodeAt(this.c)===CH_SINGLEDOT) {
     if (this.src.charCodeAt(++ this.c) === CH_SINGLEDOT) { this.lttype = '...' ;   ++this.c; return ; }
     this.err('Unexpectd ') ;
   }
   else if ( num(this.src.charCodeAt(this.c))) {
       this.lttype = 'Literal' ;
       this.c0  = this.c - 1;
       this.li0 = this.li;
       this.col0= this.col ;

       this.frac( -1 ) ;
       return;
   }
   this. ltraw = this.lttype = '.' ;
};

this.readMisc = function () { this.lttype = this.  src.   charAt (   this.c ++  )    ; };

this.expectID = function (n) {
  if (this.lttype === 'Identifier' && this.ltval === n)
    return this.next();
  
  if (this.lttype !== 'Identifier')
    this.err('an.id.was.expected',{extra:n});
 
  this.err('unexpected.id',{extra:n});
};

this.expectType_soft = function (n)  {
  if (this.lttype === n ) {
      this.next();
      return true;
  }

  return false;
};

this.expectID_soft = function (n) {
  if (this.lttype === 'Identifier' && this.ltval === n) {
     this.next();
     return true;
  }

  return false;
};

this.kw = function() {
  if (this.onToken_)
    this.lttype = 'Keyword';
};
