this.readMultiComment = function () {
  var c = this.c, l = this.src, e = l.length,
      r = -1, n = true, start = c;

  var c0 = c, li0 = this.li, col0 = this.col;

  while (c < e) {
    switch (r = l.charCodeAt(c++ ) ) {
    case CH_MUL:
      if (l.charCodeAt(c) === CH_DIV) {
        c++;
        this.col += (c-start);
        this.c = c;
        if (this.onComment_ !== null)
          this.onComment(true,c0,{line:li0,column:col0},
            this.c,{line:this.li,column:this.col});

        return n;
      }
      continue ;

    case CH_CARRIAGE_RETURN:
      if (CH_LINE_FEED === l.charCodeAt(c))
        c++;
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      start = c;
      if (n)
        n = false;
      this.col = 0;
      this.li++;
      continue;

//  default : if ( r >= 0x0D800 && r <= 0x0DBFF ) this.col-- ;

    }
  }

  this.col += (c-start);
  this.c = c;

  this.err( 'comment.multi.unfinished',{extra:{c0:c0,li0:li0,col0:col0}});
};

this.readLineComment = function() {
  var c = this.c, l = this.src,
      e = l.length, r = -1;

  var c0 = c, li0 = this.li, col0 = this.col, li = -1, col = -1;

  L:
  while ( c < e )
    switch (r = l.charCodeAt(c++ ) ) {
    case CH_CARRIAGE_RETURN:
      if (CH_LINE_FEED === l.charCodeAt(c))
        c++;
    case CH_LINE_FEED :
    case 0x2028:
    case 0x2029 :
      col = this.col;
      li = this.li;
      this.col = 0 ;
      this.li++;
      break L;
    
//  default : if ( r >= 0x0D800 && r <= 0x0DBFF ) this.col-- ;
    }

   this.c=c;

   if (this.onComment_ !== null) {
     if (li === -1) { li = this.li; col = this.col; }
     this.onComment(false,c0,{line:li0,column:col0},
       this.c,{line:li,column:col+(c-c0)});
   }

   return;
};
