UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  this.eA(n.iter).wm('.','end');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};
