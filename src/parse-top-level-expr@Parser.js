this.parseExpr =
function(ctx) {
  var head = this.parseNonSeq(PREC_NONE, ctx);
  var latestExpr = null;

  if (this.lttype !== CH_COMMA)
    return head;

  ctx &= CTX_FOR;
  ctx |= CTX_TOP;

  var e = [core(head)];
  var y = this.Y(head);
  do {
    latestExpr && this.spc(latestExpr, 'aft');
    this.next();
    latestExpr = this.parseNonSeq(PREC_NONE, ctx);
    y += this.Y(latestExpr);
    e.push(core(latestExpr));
  } while (this.lttype === CH_COMMA);

  latestExpr && this.spc(latestExpr, 'aft');

  return {
    type: 'SequenceExpression',
    expressions: e,
    start: head.start,
    end: latestExpr.end,
    loc: {
      start: head.loc.start,
      end: latestExpr.loc.end
    },
    '#y': y, '#c': {}
  };
};
