this.parseSpreadElement = function(context) {
  if (this.v <= 5) this.err('ver.spread.rest');

  var startc = this.c0;
  var startLoc = this.locBegin();

  this.next();
  var e = this.parseNonSeqExpr(
    PREC_WITH_NO_OP,
    context & ~CTX_NULLABLE);

  if (e.type === PAREN_NODE) {
    if ((context & CTX_PARAM) && !(context & CTX_HAS_A_PARAM_ERR) &&
       this.pt === ERR_NONE_YET) { 
      this.pt = ERR_PAREN_UNBINDABLE; this.pe = e;
    }
    if ((context & CTX_PAT) && !(context & CTX_HAS_AN_ASSIG_ERR) &&
       this.at === ERR_NONE_YET && !this.ensureSimpAssig_soft(e.expr)) {
      this.at = ERR_PAREN_UNBINDABLE; this.ae = e;
    }
  }
    
  return {
    type: 'SpreadElement',
    loc: { start: startLoc, end: e.loc.end },
    start: startc,
    end: e.end,
    argument: core(e)
  };
};
