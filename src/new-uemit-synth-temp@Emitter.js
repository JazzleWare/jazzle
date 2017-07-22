UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
  this.wt(n.liq.name+n.liq.idx, ETK_ID );
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var cb = CB(n); this.emc(cb, 'bef');
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).os().w('=').os().eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};
