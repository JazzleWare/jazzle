Emitters['SequenceExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCommaList(n.expressions, flags);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};
