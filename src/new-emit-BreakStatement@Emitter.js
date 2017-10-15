Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  this.w('break');
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeToCurrentLine_raw(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};
