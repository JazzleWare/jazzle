Emitters['#SubAssig'] =
Emitters['AssignmentExpression'] =
this.emitAssig = function(n, prec, flags) {
  var cc = needsConstCheck(n.left);
  if (cc)
    this.w('(').jz('cc').w('(')
        .w('\'').writeStrWithVal(n.left.name).w('\'')
        .w(')')
        .w(',')
        .s();

  this.emitAssigLeft(n.left, flags);
  this.wm(' ',n.operator,' ');
  this.emitAssigRight(n.right);

  cc && this.w(')');
};

this.emitAssigLeft = function(n, flags) {
  return this.emitHead(n, PREC_NONE, flags);
};

this.emitAssigRight = function(n) {
  this.eN(n, PREC_NONE, EC_NONE);
};
