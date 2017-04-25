this.readOp_eq =
function() {
  var c = this.c; c++; // '='
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_EQ;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.ltraw = '===';
    }
    else this.ltraw = '==';
  }
  else if (ch === CH_GREATER_THAN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '=>';
  }
  else {
    this.prec = PREC_ASSIG;
    this.ltraw = '=';
  }

  this.setsimpoff(c);
};
