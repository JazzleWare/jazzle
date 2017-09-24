Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  var attached = flags & EC_ATTACHED;
  if (!this.active(n['#scope'])) {
    attached && this.w(';');
    return;
  }

  n['#scope'].inUse = true;
  attached && this.os();

  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n);
  this.emc(cb, 'bef');
  this.w('{');
  this.i().onw(wcb_afterStmt);
  var wcbu = this.wcbUsed = {v: false, name: 'fromBlock'};
  var own = true;

  var em = 0;
  if (this.emitSimpleHead(n)) {
    em++;
    if (!this.wcb) {
      this.onw(wcb_afterStmt);
      wcbu.v = false;
      this.wcbUsed = wcbu;
    }
  }

  this.emitStmtList(n.body);
  wcbu.v ? em++ : this.clear_onw();
  this.u();
  em && this.l();

  this.emc(cb, 'inner');
  this.w('}');
  this.emc(cb, 'aft');

  return true;
};
