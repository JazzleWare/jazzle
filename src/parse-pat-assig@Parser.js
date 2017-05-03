this.parsePat_assig = 
function (head) {
  if (this.v <= 5)
    this.err('ver.assig');
  this.next() ;
  var e = this.parseNonSeqExpr(PREC_NONE, CTX_TOP);
  return {
    type: 'AssignmentPattern',
    start: head.start,
    left: head,
    end: e.end,
    right: core(e),
    loc: {
      start: head.loc.start,
      end: e.loc.end },
    '#y': -1
  };
};
