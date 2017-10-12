Emitters['Program'] =
function(n, flags, isStmt) {
  var u = null, o = {v: false}, own = false, em = 0;
  var main = n['#scope'];

  if (this.emitSourceHead(n)) {
    em++;
    if (!this.wcb) {
      this.onw(wcb_afterStmt);
      this.wcbUsed = u = o;
      own = true;
    }
  }
  else {
    ASSERT.call(this, this.wcb === null, 'wcb');
    this.onw(wcb_startStmtList);
    this.wcbUsed = u = o;
    own = true;
  }
  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');

  if (own) u.v || this.clear_onw();
  return true;
};
