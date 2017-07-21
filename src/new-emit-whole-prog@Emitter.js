Emitters['Program'] =
function(n, flags, isStmt) {
  this.wcb || this.onw(wcb_startStmtList);
  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');
  return true;
};
