this.readNumberLiteral = function (peek) {
  var c = this.c, src = this.src, len = src.length;
  var b = 10 , val = 0;
  this.lttype  = 'Literal' ;

  if (this.nl && (this.directive & DIR_MAYBE)) {
    this.gotDirective(this.dv, this.directive);
    this.directive |= DIR_HANDLED_BY_NEWLINE;
  }

  if (peek === CH_0) { // if our num lit starts with a 0
    b = src.charCodeAt(++c);
    switch (b) { // check out what the next is
      case CH_X: case CH_x:
         c++;
         if (c >= len && this.err('num.with.no.digits',{extra:'hex'}) )
           return this.errorHandlerOutput;
         b = src.charCodeAt(c);
         if ( ! isHex(b) && this.err('num.with.first.not.valid',{extra:'hex'})  )
           return this.errorHandlerOutput ;
         c++;
         while ( c < len && isHex( b = src.charCodeAt(c) ) )
             c++ ;
         this.ltval = parseInt( this.ltraw = src.slice(this.c,c) ) ;
         this.c = c;
         break;

      case CH_B: case CH_b:
        if (this.v <= 5)
          this.err('ver.bin');
        ++c;
        if (c >= len && this.err('num.with.no.digits',{extra:'binary'}) )
          return this.errorHandlerOutput ;
        b = src.charCodeAt(c);
        if ( b !== CH_0 && b !== CH_1 && this.err('num.with.first.not.valid',{extra:'binary'}) )
          return this.errorHandlerOutput ;
        val = b - CH_0; 
        ++c;
        while ( c < len &&
              ( b = src.charCodeAt(c), b === CH_0 || b === CH_1 ) ) {
           val <<= 1;
           val |= b - CH_0; 
           c++ ;
        }
        this.ltval = val ;
        this.ltraw = src.slice(this.c,c);
        this.c = c;
        break;

      case CH_O: case CH_o:
        if (this.v <= 5)
          this.err('ver.oct');
        ++c;
        if (c >= len && this.err('num.with.no.digits',{extra:'octal'}) )
          return this.errorHandlerOutput ; 
        b = src.charCodeAt(c);
        if ( (b < CH_0 || b >= CH_8) && this.err('num.with.first.not.valid',{extra:'octal'})  )
          return this.errorHandlerOutput ;

        val = b - CH_0 ;
        ++c; 
        while ( c < len &&
              ( b = src.charCodeAt(c), b >= CH_0 && b < CH_8 ) ) {
           val <<= (1 + 2);
           val |= b - CH_0;
           c++ ;
        } 
        this.ltval = val ;
        this.ltraw = src.slice(this.c,c) ;
        this.c = c;
        break;

      default:
        if ( b >= CH_0 && b <= CH_9 ) {
          if ( this.scope.insideStrict() ) this.err('num.legacy.oct');
          var base = 8;
          do {
            if ( b >= CH_8 && base === 8 ) base = 10 ;
            c ++;
          } while ( c < len &&
                  ( b = src.charCodeAt(c), b >= CH_0 && b <= CH_9) );
          
          b = this.c;
          this.c = c; 
  
          if ( !this.frac(b) )
            this.ltval = parseInt (this.ltraw = src.slice(b, c), base);
          
        }
        else {
          b = this.c ;
          this.c = c ;
          if ( !this.frac(b) ) {
             this.ltval = 0;
             this.ltraw = '0';
          }
        }
    }
  }

  else  {
    b = this.c;
    c ++ ;
    while (c < len && num(src.charCodeAt(c))) c++ ;
    this.c = c;
    if ( !this.frac(b) ) {
      this.ltval = parseInt(this.ltraw = src.slice(b, this.c)  ) ;
      this.c = c;
    }
  }
  // needless as it will be an error nevertheless, but it is still requir'd
  if ( ( this.c < len && isIDHead(src.charCodeAt(this.c))) ) this.err('num.idhead.tail') ; 
};

this . frac = function(n) {
  var c = this.c,
      l = this.src,
      e = l.length ;
  if ( n === -1 || l.charCodeAt(c)=== CH_SINGLEDOT )
     while( ++c < e && num(l.charCodeAt (c)))  ;

  switch( l.charCodeAt(c) ){
      case CH_E:
      case CH_e:
        c++;
        switch(l.charCodeAt(c)){
          case CH_MIN:
          case CH_ADD:
                 c++ ;
        }
        if ( !(c < e && num(l.charCodeAt(c))) )
          this.err('num.has.no.mantissa');

        do { c++;} while ( c < e && num(l.charCodeAt( c) ));
  }

  if ( c === this.c ) return false  ;
  this.ltraw = l.slice (n === -1 ? this.c - 1 : n, c);
  this.ltval =  parseFloat(this.ltraw )  ;
  this.c = c ;
  return true   ;
}


