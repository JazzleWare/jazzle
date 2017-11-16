Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('switch', ETK_ID).emc(cb, 'switch.aft');
  this.wm('','(').eA(n.discriminant, EC_NONE, false).w(')');
  this.emc(cb, 'cases.bef') || this.os();
  this.w('{');

  var own = {used: false};
  this.gu(wcb_afterStmt).gmon(own);
  this.emitStmtList(n.cases); // TODO: emitCases(cases []SwitchCase), to make less use of new `{used: false}` objects
  own.used ? this.l() : this.grmif(own);
  this.emc(cb, 'inner');
  this.w('}').emc(cb, 'aft');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  n.test === null ?
    this.wt('default', ETK_ID).emc(cb, 'default.aft') :
    this.wt('case', ETK_ID).gu(wcb_afterCase).eA(n.test, EC_NONE, false);

  var own = {used: false};
  this.w(':').i().gu(wcb_afterStmt).gmon(own);
  this.emitStmtList(n.consequent);
  this.u().grmif(own);
  this.emc(cb, 'aft');
  this.emc(cb, 'inner');
  return true;
};
