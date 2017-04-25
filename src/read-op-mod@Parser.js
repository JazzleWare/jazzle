this.readOp_mod =
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '%=';
  }
  else {
    this.prec = PREC_MUL;
    this.ltraw = '%';
  }
};
