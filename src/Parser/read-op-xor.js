this.readOp_xor =
function() {
  var c = this.c; c++; // '^'
  var ch = this.scat(c);

  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.lttype = TK_OP_ASSIG;
    this.ltraw = '^=';
  }
  else {
    this.prec = PREC_BIT_XOR;
    this.lttype = TK_SIMP_BINARY;
    this.ltraw = '^';
  }

  this.setsimpoff(c);
};
