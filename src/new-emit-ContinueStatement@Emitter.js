Emitters['ContinueStatement'] =
function(n, flags, isStmt) {
  this.w('continue');
  n.label && this.hs().writeIDName(n.label.name);
  this.w(';');
};
