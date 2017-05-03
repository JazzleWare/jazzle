Emitters['#ResolvedThis'] = function(n, isStmt, flags) {
  this.w(n.verbatim ? 'this' : n.decl.synthName);
};
