UntransformedEmitters['cvtz'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('o').w('(').eN(n.value);
  if (n.rn.tz)
    this.w(',').emitAccessChk_tz(n.rn.target, n.rn.id.loc.start);
  if (n.rn.cv)
    this.w(',').emitAccessChk_invalidSAT(n.rn.target, n.rn.id.loc.start);
  this.w(')');
};
