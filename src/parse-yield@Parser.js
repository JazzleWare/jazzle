this.parseYield = 
function(ctx) {
  var c = this.c, li = this.li, col = this.col;
  var deleg = false, arg = null;
  var c0 = this.c0, loc0 = this.loc0();

  this.next(); // 'yield'

  if (!this.nl) {
    if (this.lttype === TK_SIMPLE_BINARY && this.ltraw === '*') {
      deleg = true;
      this.next(); // '*'
      arg = this.parseNonSeqExpr(PREC_NONE, ctx&CTX_FOR);
      if (!arg)
        this.err('yield.has.no.expr.deleg');
    }
    else
      arg = this.parseNonSeqExpr(PREC_NONE, (ctx&CTX_FOR)|CTX_NULLABLE);
  }

  var ec = -1, eloc = null;
  if (arg) { ec = arg.end; eloc = arg.loc.end; }
  else { ec = c; eloc = { line: li, column: col }; }

  var n = {
    type: 'YieldExpression',
    argument: arg && core(arg),
    start: c0,
    delegate: deleg,
    end: ec,
    loc: { start : loc0, end: eloc },
    '#y':-1
  };
 
  if (this.suspys === null)
    this.suspys = n;

  return n;
};
