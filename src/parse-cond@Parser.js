this.parseCond = function(cond, ctx) {
  this.next(); // '?'
  var seq = this.parseNonSeq(PREC_NONE, CTX_TOP);

  if (!this.expectT(CH_COLON))
    this.err('cond.colon',{extra:[cond,seq,context]});

  var alt = this.parseNonSeq(PREC_NONE, (ctx&CTX_FOR)|CTX_TOP);
  return {
    type: 'ConditionalExpression',
    test: core(cond),
    start: cond.start,
    end: alt.end,
    loc: {
      start: cond.loc.start,
      end: alt.loc.end },
    consequent: core(seq),
    alternate: core(alt),
    '#y': -1
  };
};
