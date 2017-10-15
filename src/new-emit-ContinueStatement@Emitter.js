Emitters['ContinueStatement'] =
function(n, flags, isStmt) {
  this.w('continue');
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeIDName(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};
