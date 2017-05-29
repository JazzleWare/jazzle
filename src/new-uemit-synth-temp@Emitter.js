UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
  this.w(n.liq.name+n.liq.idx);
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).s().w('=').s().eN(n.right);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
