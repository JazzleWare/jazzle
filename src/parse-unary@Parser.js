this.parseUnaryExpression =
function(ctx) {
  var op = "", loc0 = this.loc0(), c0 = this.c0, vdt = this.vdt;

  if (vdt !== VDT_NONE) {
    this.vdt = VDT_NONE;
    op = this.ltval;
  }
  else
    op = this.ltraw;

  this.next();
  var arg = this.parseNonSeqExpr(PREC_UNARY, context & CTX_FOR);

  if (this.scope.insideStrict() &&
    vdt === VDT_DELETE &&
    core(arg).type !== 'MemberExpression')
    this.err('delete.arg.not.a.mem',{tn:arg,extra:{c0:startc,loc0:startLoc,context:context}});

  if (vdt === VDT_AWAIT) {
    var n = {
      type: 'AwaitExpression',
      argument: core(arg),
      start: c0,
      end: arg.end,
      loc: { start: loc0, end: arg.loc.end }
    };
    this.suspys = n;
    return n;
  }

  return {
    type: 'UnaryExpression',
    operator: op,
    start: c0,
    end: arg.end,
    loc: { start: loc0, end: arg.loc.end },
    argument: core(arg),
    prefix: true
  };
};
