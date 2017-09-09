UntransformedEmitters['rcheck'] =
function(n, flags, isStmt) {
  this.jz('r').wm('(',n.th.synthName,')');
  isStmt && this.w(';');
};
