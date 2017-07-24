Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('switch', ETK_ID).emc(cb, 'switch.aft');
  this.wm('','(').eA(n.discriminant, EC_NONE, false).w(')');
  this.emc(cb, 'cases.bef') || this.os();
  this.w('{');
  this.onw(wcb_afterStmt);
  this.emitStmtList(n.cases);
  this.wcb ? this.clear_onw() : this.l();
  this.emc(cb, 'inner');
  this.w('}');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  n.test === null ?
    this.wt('default', ETK_ID).emc(cb, 'default.aft') :
    this.wt('case', ETK_ID).onw(wcb_afterCase).eA(n.test, EC_NONE, false);

  this.w(':').i().onw(wcb_afterStmt);
  this.emitStmtList(n.consequent);
  this.u();
  this.wcb && this.clear_onw();
  this.emc(cb, 'aft');
  this.emc(cb, 'inner');
  return true;
};
