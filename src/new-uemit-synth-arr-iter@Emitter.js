UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  this.eA(n.iter).wm('.','end');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter').w('(').eN(n.iter).w(')');
  return true;
};
