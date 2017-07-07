this.parseYield = 
function(ctx) {
  var c = this.c, li = this.li, col = this.col;
  var deleg = false, arg = null;
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'yield'

  if (!this.nl) {
    if (this.peekMul()) {
      deleg = true;
      this.suc(cb, '*.bef');
      this.next(); // '*'
      arg = this.parseNonSeq(PREC_NONE, ctx&CTX_FOR);
      if (!arg)
        this.err('yield.has.no.expr.deleg');
    }
    else
      arg = this.parseNonSeq(PREC_NONE, (ctx&CTX_FOR)|CTX_NULLABLE);
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
    '#y': 1+this.Y0(arg), '#c': cb
  };

  if (this.suspys === null)
    this.suspys = n;

  return n;
};
