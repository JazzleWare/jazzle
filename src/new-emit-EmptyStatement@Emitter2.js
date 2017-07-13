Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  this.rtt();
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  return true;
};
