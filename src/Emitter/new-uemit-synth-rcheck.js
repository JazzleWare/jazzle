UntransformedEmitters['rcheck'] =
function(n, flags, isStmt) {
  this.jz('r').w('(');
  if (n.val) { this.eN(n.val, EC_NONE, false).w(',').os(); }
  this.wm(n.th.synthName,')');
  isStmt && this.w(';');
};
