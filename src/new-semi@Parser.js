this.semi =
function() {
  var t = this.lttype;
  if (t === CH_SEMI) {
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
    this.semiC = this.c0;
    this.semiLoc = this.locOn(1);
    return true;
  }

  return false;
};
