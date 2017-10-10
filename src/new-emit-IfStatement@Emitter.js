Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var conax = n['#ifScope'], altax = n['#elseScope'];
  if (!this.active(conax) && !(altax && this.active(altax)))
    return this.emitAny(n.test, flags|EC_START_STMT, isStmt);

  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('if', ETK_ID).emc(cb, 'aft.if');
  this.wm('','(').eA(n.test, EC_NONE, false).w(')');

  if (this.active(conax)) { this.emitIfBody(n.consequent); }
  else this.w(';');

  if (n.alternate && this.active(altax)) {
    this.l().wt('else', ETK_ID).onw(wcb_afterElse).emitElseBody(n.alternate);
  }

  this.emc(cb, 'aft');

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
    if (isAssigList(stmt.expression))
      this.os().emitAny(stmt.expression, EC_START_STMT|EC_ATTACHED, true);
    else {
      this.i();
      this.l().emitStmt(stmt, true);
      this.u();
    }
    return true;
  }
  this.os().w('{').i().onw(wcb_afterStmt);
  this.emitStmt(stmt, true);
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
