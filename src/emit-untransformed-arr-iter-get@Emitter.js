UntransformedEmitters['arr-iter-get'] = function(n, isStmt, flags) {
  this.eH(n.iter).wm('.',(n.rest ? 'rest' : 'get'),'(',')');
  isStmt && this.w(';');
};
