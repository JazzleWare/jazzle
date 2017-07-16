Emitters['Program'] =
function(n, flags, isStmt) {
  this.wcb || this.onw(wcb_startStmtList);
  this.emitStmtList(n.body);
  return true;
};
