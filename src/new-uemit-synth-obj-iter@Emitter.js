UntransformedEmitters['obj-iter'] =
function(n, flags, isStmt) {
  ;
  this.jz('objIter').w('(').eN(n.iter).w(')');
  return true;
};

UntransformedEmitters['obj-iter-end'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  ;
  this.eH(n.iter);
  this.wm('.','val');
  return true;
};

UntransformedEmitters['obj-iter-get'] =
function(n, flags, isStmt) {
  ;
  this.eH(n.iter).wm('.','get','(');
  if (n.computed)
    this.eN(n.idx);
  else
    this.writeMemName(n.idx, true);
  this.w(')');
  return true;

};
