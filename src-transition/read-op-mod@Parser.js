this.readOp_mod =
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    this.lttype = TK_OP_ASSIG;
    c++;
    this.ltraw = '%=';
  }
  else {
    this.lttype = TK_SIMP_BINARY;
    this.prec = PREC_MUL;
    this.ltraw = '%';
  }
};
