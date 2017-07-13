Emitters['Program'] =
function(n, flags, isStmt) {
  this.rtt();
  this.emitStmtList(n.body);
  return true;
};
