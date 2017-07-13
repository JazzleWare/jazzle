Emitters['IfStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.wm('if',' ','(').eA(n.test, EC_NONE, false).w(')').emitIfBody(n.consequent);
  n.alternate && this.l().w('else').emitElseBody(n.alternate);
  return true;
};

this.emitIfBody =
function(stmt) {
  switch (stmt.type) {
  case 'BlockStatement':
    this.s();
  case 'EmptyStatement':
    return this.emitAny(stmt, EC_START_STMT, true);
  }
  if (stmt.type === 'ExpressionStatement') {
    this.i();
    var em = this.l().emitAny(stmt, EC_START_STMT, true);
    this.u();
    return em;
  }
  this.s().w('{').i().wsl();
  this.emitAny(stmt, EC_START_STMT, true) ? this.wsl() : this.csl();
  this.u().w('}');
  return true;
};

this.emitElseBody =
function(stmt) {
  if (stmt.type === 'IfStatement')
    return this.s().emitAny(stmt, EC_START_STMT, true);
  return this.emitBody(stmt);
};
