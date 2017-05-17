UntransformedEmitters['arr-iter-end'] = function(n, isStmt, flags) {
  this.eH(n.iter).wm('.','end','(',')');
  isStmt && this.w(';');
};
