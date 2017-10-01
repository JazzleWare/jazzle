Emitters['ContinueStatement'] =
function(n, flags, isStmt) {
  this.w('continue').hs().writeIDName(n.label.name);
  this.w(';');
};
