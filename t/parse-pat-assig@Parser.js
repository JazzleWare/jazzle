this .parseAssig = function (head) {
  if (this.v <= 5)
    this.err('ver.assig');
  this.next() ;
  var e = this.parseNonSeqExpr( PREC_WITH_NO_OP, CTX_PAT|CTX_NO_SIMPLE_ERR );
  return { type: 'AssignmentPattern', start: head.start, left: head, end: e.end,
         right: core(e), loc: { start: head.loc.start, end: e.loc.end } /* ,y:-1*/};
};


