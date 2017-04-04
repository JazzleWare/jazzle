UntransformedEmitters['arr-iter-get'] = function(n, isStmt, flags) {
  this.eH(n.iter).wm('.','get','(',')');
  isStmt && this.w(';');
};
