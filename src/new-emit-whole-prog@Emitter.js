Emitters['Program'] =
function(n, flags, isStmt) {
  ;
  this.emitStmtList(n.body);
  return true;
};
