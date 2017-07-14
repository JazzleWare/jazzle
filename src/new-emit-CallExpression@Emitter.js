Emitters['CallExpression'] =
function(n, flags, isStmt) {
  ;
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCallHead(n.callee, flags);
  this.w('(').emitCommaList(n.arguments);
  this.w(')');

  hasParen && this.w(')');
  isStmt && this.w(';');
};
