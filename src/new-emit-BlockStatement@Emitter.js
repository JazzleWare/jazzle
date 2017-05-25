Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w('{');
  this.i().wsl();
  this.emitStmtList(n.body) ?
    this.wsl() : this.csl();
  this.u().w('}');
  return true;
};
