Emitters['SwitchStatement'] =
function(n, flags, isStmt) {
  this.wm('switch',' ','(').eA(n.discriminant, EC_NONE, false).wm(')',' ','{');
  var c0 = this.sc("");
  this.emitStmtList(n.cases);
  c0 = this.sc(c0);
  if (c0.length)
    this.l().ac(c0).l();

  this.w('}');
  return true;
};

Emitters['SwitchCase'] =
function(n, flags, isStmt) {
  n.test === null ? this.w('default') : this.wm('case',' ').eA(n.test, EC_NONE, false);
  this.w(':').i();
  var t0 = this.sc("");
  this.emitStmtList(n.consequent);
  t0 = this.sc(t0);
  if (t0.length)
    this.l().w(t0);
  this.u();
  return true;
};
