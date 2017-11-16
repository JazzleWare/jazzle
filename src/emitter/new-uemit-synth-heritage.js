UntransformedEmitters['heritage'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('h').sl(n.heritage.loc.start);

  this.w('(').eN(n.heritage, EC_NONE, false).w(')');
};
