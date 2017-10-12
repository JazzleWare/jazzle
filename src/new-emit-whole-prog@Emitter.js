Emitters['Program'] =
function(n, flags, isStmt) {
  var main = n['#scope'];

  var lsn = null, own = {used: false};
  lsn = this.listenForEmits(own);
  this.emitSourceHead(n);
  if (lsn.used) this.trygu(wcb_afterStmt, own);

  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');

  own.used || this.grmif(own);
};
