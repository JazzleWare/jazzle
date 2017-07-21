Emitters['CallExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef');
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCallHead(n.callee, flags);
  this.w('(').emitCommaList(n.arguments);
  this.emc(cb, 'inner');
  this.w(')');

  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
};
