
Emitters['ExpressionStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  ASSERT.call(this, flags & EC_START_STMT, 'must be in stmt context');
  this.emitAny(n.expression, flags, true );
  this.emc(cb, 'aft');
  return true;
};

