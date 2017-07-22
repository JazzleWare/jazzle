UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  this.emc(cb, 'aft'); // TODO: unnecessary
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.eA(n.iter).wm('.','end');
  this.wm('(',')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter').w('(').eN(n.iter).w(')');
  return true;
};

UntransformedEmitters['arr-iter-get-rest'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  this.eA(n.iter).wm('.','rest').wm('(',')').emc(cb, 'aft');

  return true;
};
