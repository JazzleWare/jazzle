Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.rtt();
  this.w('{');
  this.i().onW(cb_STMT);
  this.emitStmtList(n.body);
  this.u();
  this.wcb ? this.clear_onw() : this.l();
  this.w('}');
  return true;
};
