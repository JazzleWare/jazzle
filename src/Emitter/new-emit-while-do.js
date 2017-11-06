Emitters['DoWhileStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.wt('do',ETK_ID).os();

  var nbody = n.body, notBlock = nbody.type !== 'BlockStatement';

  var own = null;
  if (notBlock) {
    own = {used: false};
    this.w('{').i().gu(wcb_afterStmt).gmon(own);
  }

  this.emitStmt(n.body);

  if (notBlock) {
    this.u();
    if (own.used) this.l();
    else
      this.grmif(own);
    this.w('}');
  }

  this.os().w('while');
  this.emc(cb, 'while.aft') || this.os();
  this.w('(').eA(n.test, EC_NONE, false).w(')').emc(cb, 'cond.aft');
  this.w(';').emc(cb, 'aft');
  return true;
};
