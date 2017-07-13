UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
  this.wt(n.liq.name+n.liq.idx, ETK_ID );
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).os().w('=').os().eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
