this.readEsc = function ()  {
  var src = this.src, b0 = 0, b = 0, start = this.c;
  switch ( src.charCodeAt ( ++this.c ) ) {
   case CH_BACK_SLASH: return '\\';
   case CH_MULTI_QUOTE: return'\"' ;
   case CH_SINGLE_QUOTE: return '\'' ;
   case CH_b: return '\b' ;
   case CH_v: return '\v' ;
   case CH_f: return '\f' ;
   case CH_t: return '\t' ;
   case CH_r: return '\r' ;
   case CH_n: return '\n' ;
   case CH_u:
      b0 = this.peekUSeq();
      if ( b0 >= 0x0D800 && b0 <= 0x0DBFF ) {
        this.c++;
        return String.fromCharCode(b0, this.peekTheSecondByte());
      }
      return fromcode(b0);

   case CH_x :
      b0 = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      b = toNum(this.src.charCodeAt(++this.c));
      if ( b === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      return String.fromCharCode((b0<<4)|b);

   case CH_0: case CH_1: case CH_2:
   case CH_3:
       b0 = src.charCodeAt(this.c);
       if ( this.scope.insideStrict() ) {
          if ( b0 === CH_0 ) {
               b0 = src.charCodeAt(this.c +  1);
               if ( b0 < CH_0 || b0 >= CH_8 )
                 return '\0';
          }
          if ( this.err('strict.oct.str.esc') )
            return this.errorHandlerOutput
       }
       else if (this.directive !== DIR_NONE) {
         if (this.esct === ERR_NONE_YET) {
           this.eloc.c0 = this.c;
           this.eloc.li0 = this.li;
           this.eloc.col0 = this.col + (this.c-start);
           this.esct = ERR_PIN_OCTAL_IN_STRICT;
         }
       }

       b = b0 - CH_0;
       b0 = src.charCodeAt(this.c + 1 );
       if ( b0 >= CH_0 && b0 < CH_8 ) {
          this.c++;
          b <<= 3;
          b += (b0-CH_0);
          b0 = src.charCodeAt(this.c+1);
          if ( b0 >= CH_0 && b0 < CH_8 ) {
             this.c++;
             b <<= 3;
             b += (b0-CH_0);
          }
       }
       return String.fromCharCode(b)  ;

    case CH_4: case CH_5: case CH_6: case CH_7:
       if (this.scope.insideStrict())
         this.err('strict.oct.str.esc');
       else if (this.directive !== DIR_NONE) {
         if (this.esct === ERR_NONE_YET) {
           this.eloc.c0 = this.c;
           this.eloc.li0 = this.li;
           this.eloc.col0 = this.col + (this.c-start);
           this.esct = ERR_PIN_OCTAL_IN_STRICT;
         }
       }

       b0 = src.charCodeAt(this.c);
       b  = b0 - CH_0;
       b0 = src.charCodeAt(this.c + 1 );
       if ( b0 >= CH_0 && b0 < CH_8 ) {
          this.c++; 
          b <<= 3; 
          b += (b0-CH_0);
       }
       return String.fromCharCode(b)  ;

   case CH_8:
   case CH_9:
       if ( this.err('esc.8.or.9') ) 
         return this.errorHandlerOutput ;
       return '';

   case CH_CARRIAGE_RETURN:
      if ( src.charCodeAt(this.c + 1) === CH_LINE_FEED ) this.c++;
   case CH_LINE_FEED:
   case 0x2028:
   case 0x2029:
      start = this.c;
      this.col = 0;
      this.li++;
      return '';

   default:
      return src.charAt(this.c) ;
  }
};

this.readStrictEsc = function ()  {
  var src = this.src, b0 = 0, b = 0;
  switch ( src.charCodeAt ( ++this.c ) ) {
   case CH_BACK_SLASH: return '\\';
   case CH_MULTI_QUOTE: return'\"' ;
   case CH_SINGLE_QUOTE: return '\'' ;
   case CH_b: return '\b' ;
   case CH_v: return '\v' ;
   case CH_f: return '\f' ;
   case CH_t: return '\t' ;
   case CH_r: return '\r' ;
   case CH_n: return '\n' ;
   case CH_u:
      b0 = this.peekUSeq();
      if ( b0 >= 0x0D800 && b0 <= 0x0DBFF ) {
        this.c++;
        return String.fromCharCode(b0, this.peekTheSecondByte());
      }
      return fromcode(b0);

   case CH_x :
      b0 = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      b = toNum(this.src.charCodeAt(++this.c));
      if ( b0 === -1 && this.err('hex.esc.byte.not.hex') )
        return this.errorHandlerOutput;
      return String.fromCharCode((b0<<4)|b);

   case CH_0: case CH_1: case CH_2:
   case CH_3:
       b0 = src.charCodeAt(this.c);
       if ( b0 === CH_0 ) {
            b0 = src.charCodeAt(this.c +  1);
            if ( b0 < CH_0 || b0 >= CH_8 )
              return '\0';
       }
       if ( this.err('strict.oct.str.esc.templ') )
         return this.errorHandlerOutput

    case CH_4: case CH_5: case CH_6: case CH_7:
       if (this.err('strict.oct.str.esc.templ') )
         return this.errorHandlerOutput  ;

   case CH_8:
   case CH_9:
       if ( this.err('esc.8.or.9') ) 
         return this.errorHandlerOutput ;

   case CH_CARRIAGE_RETURN:
      if ( src.charCodeAt(this.c + 1) === CH_LINE_FEED ) this.c++;
   case CH_LINE_FEED:
   case 0x2028:
   case 0x2029:
      this.col = 0;
      this.li++;
      return '';

   default:
      return src.charAt(this.c) ;
  }
};


