
Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  this.emc(cb, 'aft');
  return true;
};

