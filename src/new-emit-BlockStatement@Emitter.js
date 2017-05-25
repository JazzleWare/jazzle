Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w('{');
  if (n.body.length) {
    this.i().wsl();
    this.emitStmtList(n.body).u();
  }
  this.w('}');
  return true;
};
