Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ;
  ASSERT_EQ.call(this, isStmt, true);
  this.wt('if', ETK_ID).wm('','(').eA(n.test, EC_NONE, false).w(')').emitIfBody(n.consequent);
  n.alternate && this.l().wt('else', ETK_ID).onw(wcb_afterElse).emitElseBody(n.alternate);
  return true;
};

this.emitIfBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.os();
  case 'EmptyStatement':
    return this.emitStmt(stmt);
  }
  if (stmt.type === 'ExpressionStatement') {
    this.i();
    var em = this.l().emitStmt(stmt);
    this.u();
    return em;
  }
  this.os().w('{').i().onw(wcb_afterStmt);
  this.emitStmt(stmt);
  this.wcb ? this.clear_onw() : this.onw(wcb_afterStmt);
  this.u().w('}');

  return true;
};

this.emitElseBody =
function(stmt) {
  if (stmt.type === 'IfStatement')
    return this.emitStmt(stmt);
  return this.emitBody(stmt);
};
