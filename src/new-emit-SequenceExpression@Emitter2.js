Emitters['SequenceExpression'] =
function(n, flags, isStmt) {
  this.rtt();
  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCommaList(n.expressions, flags);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
