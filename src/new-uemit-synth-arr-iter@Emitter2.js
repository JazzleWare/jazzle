UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  this.rtt();
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  this.rtt();
  this.eA(n.iter).wm('.','end');
  this.wm('(',')');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.rtt();
  this.jz('arrIter').w('(').eN(n.iter).w(')');
  return true;
};

UntransformedEmitters['arr-iter-get-rest'] =
function(n, flags, isStmt) {
  this.rtt();
  return this.eA(n.iter).wm('.','rest').wm('(',')'), true;
};
