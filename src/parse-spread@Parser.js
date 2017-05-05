this.parseSpread = 
function(ctx) {
  this.v <= 5 && this.err('ver.spread.rest');

  var c0 = this.c0, loc0 = this.loc0();
  this.next();

  var arg = this.parseNonSeq(PREC_NONE, ctx);
  if (arg === null)
    this.err('spread.arg.is.null');

  if (arg.type === PAREN_NODE) {
    if (errt_ptrack(ctx)) { 
      this.pt = ERR_PAREN_UNBINDABLE;
      this.pe = arg;
    }
    if (errt_atrack(ctx) && !this.ensureSAT(arg.expr)) {
      this.at = ERR_PAREN_UNBINDABLE;
      this.ae = arg;
    }
  }
    
  return {
    type: 'SpreadElement',
    loc: { start: loc0, end: arg.loc.end },
    start: c0,
    end: arg.end,
    argument: core(arg)
  };
};
