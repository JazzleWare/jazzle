Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  this.wm('switch',' ','(').eA(n.discriminant, EC_NONE, false).wm(')',' ','{');
  this.onW(onW_line);
  this.emitStmtList(n.cases);
  this.hasOnW() ? this.clearOnW() : this.l();
  this.w('}');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  n.test === null ? this.w('default') : this.wm('case',' ').eA(n.test, EC_NONE, false);
  this.w(':').i().onW(onW_line);
  this.emitStmtList(n.consequent);
  this.u();
  this.hasOnW() && this.clearOnW();
  return true;
};
