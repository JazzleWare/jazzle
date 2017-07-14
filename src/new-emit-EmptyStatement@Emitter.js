Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  ;
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  return true;
};
