this.parseExpr = function (context) {
  var head = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
  var lastExpr = null;

  if ( this.lttype !== ',' )
    return head;

  // TODO: abide to the original context by using `context = context|(CTX_FOR|CTX_PARPAT)` rather than the
  // assignment below
  context &= (CTX_FOR|CTX_PARPAT);

  var e = [core(head)];
  do {
    this.next() ;
    lastExpr = this.parseNonSeqExpr(PREC_WITH_NO_OP, context);
    e.push(core(lastExpr));
  } while (this.lttype === ',' );

  return {
    type: 'SequenceExpression', expressions: e,
    start: head.start, end: lastExpr.end,
    loc: { start : head.loc.start, end : lastExpr.loc.end}/* ,y:-1*/
  };
};


