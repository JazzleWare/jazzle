Emitters['UpdateExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o);
    flags = EC_NONE;
  }
  this.emitSAT(n.argument, flags);
  if (!n.prefix)
    this.w(o);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
