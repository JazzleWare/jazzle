
this.semi =
function(cb, i) {
  var t = this.lttype;
  if (t === CH_SEMI) {
    cb && this.suc(cb, i);
    this.semiC = this.c;
    this.semiLoc = this.loc();
    this.next();
    return true;
  }

  if (this.nl) {
    this.semiC = 0;
    this.semiLoc = null;
    return true;
  }

  switch (t) {
  case TK_EOF:
    this.semiC = this.c;
    this.semiLoc = this.loc();
    return true;

  case CH_RCURLY:
    cb && this.suc(cb, i);
    this.semiC = this.c0;
    this.semiLoc = this.loc0();
    return true;
  }

  return false;
};

