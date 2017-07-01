Emitters['BlockStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  this.w('{');
  this.i().onW(onW_line);
  this.emitStmtList(n.body);
  this.u();
  this.hasOnW() ? this.clearOnW() : this.l();
  this.w('}');
  return true;
};
