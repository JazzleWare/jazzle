this.readOp_or =
function() {
  var c = this.c; c++; // '|'
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '|=';
  }
  else if (ch === CH_OR) {
    c++; this.prec = PREC_LOG_OR;
    this.ltraw = '||';
  }
  else {
    this.prec = PREC_BIT_OR;
    this.ltraw = '|';
  }

  this.setsimpoff(c);
};
