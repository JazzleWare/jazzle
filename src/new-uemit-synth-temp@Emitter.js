UntransformedEmitters['temp'] =
function(n, flags, isStmt) {
//this.wt(n.liq.name+n.liq.idx, ETK_ID );
  this.wt(n.liq.synthName, ETK_ID);
  return true;
};

UntransformedEmitters['temp-save'] =
function(n, flags, isStmt) {
  var rightonly = false;
  var right = n.right;
//if (right.type === '#Untransformed' && right.kind === 'assig-list') {
//  var list = right.list, e = list.length;
//  if (e && list[ e - 1] === n.left)
//    return this.emitAny(n.right, flags, isStmt);
//}

  var hasParen = flags & EC_EXPR_HEAD;
  var cb = CB(n); this.emc(cb, 'bef');
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.eA(n.left, flags, false).os().w('=').os().eN(n.right, flags & EC_IN, false);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};
