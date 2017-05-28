Emitters['#SynthAssig'] =
Emitters['AssignmentExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitSAT(n.left, flags);
  this.s();
  this.w(n.operator);
  this.s();
  this.eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
