Emitters['Program'] =
function(n, flags, isStmt) {
  if (this.emitSourceHead(n))
    this.wcb || this.onw(wcb_afterStmt);
  else
    this.wcb || this.onw(wcb_startStmtList);
  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');
  return true;
};
