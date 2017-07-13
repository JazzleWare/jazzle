Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  this.rtt();
  ASSERT_EQ.call(this, isStmt, true);
  this.wt('do',ETK_ID).wm('','{').i().onw(wcb_afterStmt);
  this.emitStmt(n.body);
  this.u();
  this.wcb ? this.clear_onw() : this.l();
  this.wm('}','','while','','(').eA(n.test, EC_NONE, false).wm(')',';');
  return true;
};
