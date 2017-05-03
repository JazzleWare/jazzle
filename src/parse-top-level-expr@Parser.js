this.parseExpr =
function(ctx) {
  var head = this.parseNonSeqExpr(PREC_NONE, ctx);
  var latestExpr = null;

  if (this.lttype !== CH_COMMA)
    return head;

  ctx &= CTX_FOR;
  ctx |= CTX_TOP;

  var e = [core(head)];
  do {
    this.next();
    latestExpr = this.parseNonSeqExpr(PREC_NONE, ctx);
    e.push(core(latestExpr));
  } while (this.lttype === CH_COMMA);

  return {
    type: 'SequenceExpression',
    expressions: e,
    start: head.start,
    end: latestExpr.end,
    loc: {
      start: head.loc.start,
      end: latestExpr.loc.end
    },
    '#y': -1
  };
};
