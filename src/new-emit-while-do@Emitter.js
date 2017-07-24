Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.wt('do',ETK_ID).os();
  if (n.body.type !== 'BlockStatement')
    this.w('{').i().onw(wcb_afterStmt);
  this.emitStmt(n.body);
  if (n.body.type !== 'BlockStatement') {
    this.u();
    this.wcb ? this.clear_onw() : this.l();
    this.w('}');
  }
  this.os().w('while');
  this.emc(cb, 'while.aft') || this.os();
  this.w('(').eA(n.test, EC_NONE, false).w(')').emc(cb, 'cond.aft');
  this.w(';').emc(cb, 'aft');
  return true;
};
