this.readOp_and = 
function() {
  var c = this.c; c++;
  var ch = this.scat(c);

  this.lttype = TK_SIMP_BINARY;
  if (ch === CH_EQUALITY_SIGN) {
    c++; this.prec = PREC_ASSIG;
    this.ltraw = '&=';
  }
  else if (ch === CH_AND) {
    c++; this.prec = PREC_LOG_AND;
    this.ltraw = '&&';
  }
  else {
    this.prec = PREC_BIT_AND;
    this.ltraw = '&';
  }

  this.setsimpoff(c);
};
