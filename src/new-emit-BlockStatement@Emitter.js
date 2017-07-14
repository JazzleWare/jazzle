Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w('{');
  this.i().onw(wcb_afterStmt);
  this.emitStmtList(n.body);
  this.u();
  this.wcb ? this.clear_onw() : this.l();
  this.w('}');
  return true;
};
