Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  this.wt('switch', ETK_ID).wm('','(').eA(n.discriminant, EC_NONE, false).wm(')','','{');
  this.onw(wcb_afterStmt);
  this.emitStmtList(n.cases);
  this.wcb ? this.clear_onw() : this.l();
  this.w('}');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  n.test === null ? this.wt('default', ETK_ID) : this.wt('case', ETK_ID).onw(wcb_afterCase).eA(n.test, EC_NONE, false);
  this.w(':').i().onw(wcb_afterStmt);
  this.emitStmtList(n.consequent);
  this.u();
  this.wcb && this.clear_onw();
  return true;
};
