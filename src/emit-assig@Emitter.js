Emitters['SyntheticAssignment'] =
Emitters['AssignmentExpression'] =
this.emitAssig = function(n, prec, flags) {
  this.emitAssigLeft(n.left, flags);
  this.wm(' ',n.operator,' ');
  this.emitAssigRight(n.right);
};

this.emitAssigLeft = function(n, flags) {
  return this.emitHead(n, PREC_NONE, flags);
};

this.emitAssigRight = function(n) {
  this.eN(n, PREC_NONE, EC_NONE);
};
