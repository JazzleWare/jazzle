Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  this.w('break');
  n.label && this.hs().writeIDName(n.label.name);
  this.w(';');
};
