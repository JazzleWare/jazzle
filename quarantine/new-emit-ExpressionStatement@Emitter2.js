Emitters['ExpressionStatement'] =
function(n, flags, isStmt) {
  this.rtt();
  ASSERT_EQ.call(this, isStmt, true);
  ASSERT.call(this, flags & EC_START_STMT, 'must be in stmt context');
  return this.emitAny(n.expression, flags, true);
};
