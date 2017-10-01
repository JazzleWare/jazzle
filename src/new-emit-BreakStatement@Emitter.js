Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  this.w('break').hs().writeIDName(n.label.name);
  this.w(';');
};
