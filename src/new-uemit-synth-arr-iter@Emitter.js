UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  return true;
};
