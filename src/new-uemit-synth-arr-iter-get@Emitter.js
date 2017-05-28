UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter').w('(').eN(n.iter).w(')');
  return true;
};
