this.readOp_lt =
function() {
  var c = this.c; c++; // '<'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++;
    this.prec = PREC_COMP;
    this.ltraw = '<=';
  }
  else if (ch === CH_LESS_THAN) {
    c++;
    ch = this.scat(c);
    if (ch === CH_EQUALITY_SIGN) {
      c++;
      this.prec = PREC_ASSIG;
      this.ltraw = '<<=';
    }
    else {
      this.prec = PREC_SH;
      this.ltraw = '<<';
    }
  }
  else {
    this.prec = PREC_COMP;
    this.ltraw = '<';
  }

  this.setsimpoff(c);
};
