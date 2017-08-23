Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n);
  this.emc(cb, 'bef');
  this.w('{');
  this.i().onw(wcb_afterStmt);
  var wcbu = this.wcbUsed = {v: false, name: 'fromBlock'};

  if (this.emitSimpleHead(n))
    this.wcb || this.onw(wcb_afterStmt);

  this.emitStmtList(n.body);
  if (wcbu.v) { // if something was emitted
    this.u();
    this.l();
  } else {
    this.clear_onw();
    this.u();
  }
  this.emc(cb, 'inner');
  this.w('}');
  this.emc(cb, 'aft');

  return true;
};
