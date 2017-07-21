Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n);
  this.emc(cb, 'bef');
  this.w('{');
  this.i().onw(wcb_afterStmt);
  this.emitStmtList(n.body);
  this.u();
  this.wcb ? this.clear_onw() : this.l();
  this.emc(cb, 'inner');
  this.w('}');
  this.emc(cb, 'aft');

  return true;
};
