Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  var attached = flags & EC_ATTACHED;
  attached && this.os();

  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n);
  this.emc(cb, 'bef');
  this.w('{').i();
  var lead = n['#lead'];

  var own = {used: false}, lsn = null;

  this.gu(wcb_afterStmt).gmon(own);

  var em = 0;
  if (lead) {
    this.emitStmt(lead, false);
    if (own.used) { em++; this.trygu(wcb_afterStmt, own); }
  }

  var lsn = this.listenForEmits(own);
  this.emitSimpleHead(n);
  if (lsn.used) { em++; this.trygu(wcb_afterStmt, own); }

  lsn = this.listenForEmits(own);
  this.emitStmtList(n.body);
  lsn.used && em++;

  this.grmif(own);

  this.u();
  em && this.l();

  this.emc(cb, 'inner');
  this.w('}');
  this.emc(cb, 'aft');

  return true;
};
