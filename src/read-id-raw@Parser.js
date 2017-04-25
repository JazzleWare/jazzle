this.readID_withHead = 
function(v) {
  var c = this.c,
      s = this.src,
      l = s.length,
      surrogateTail = -1,
      luo = c, ccode = -1;

  while (c < l) {
    var ch = s.charCodeAt(c);
    if (isIDBody(ch)) c++;
    else {
      var bs = false;
      if (ch === CH_BACK_SLASH) {
        if (luo < c)
          v += s.substring(luo,c);

        this.setsimpoff(c);
        ch = this.readBS();
        bs = true;
      }
      if (ch >= 0x0D800 && ch <= 0x0DBFF) {
        surrogateTail = this.readSurrogateTail();
        ccode = surrogate(ch, surrogateTail);
        !isIDBody(ccode) && this.err('surrogate.not.an.id.body');
        v += String.fromCharCode(ch) + String.fromCharCode(surrogateTail);
      }
      else if (bs)
        v += ch > 0xFFFF ?
          cp2sp(ch) :
          String.fromCharCode(ch);
      else
        break;

      c = luo = this.c;
    }
  }

  if (luo < c)
    v += s.substring(luo,c);

  this.setsimpoff(c);

  this.ltval = v;
  this.ltraw = this.c0_to_c();
  this.lttype = TK_ID;
};
