UntransformedEmitters['cvtz'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('o').w('(').eN(n.value);
  if (n.rn.tz)
    this.w(',').os().emitAccessChk_tz(tg(n.rn), n.rn.id.loc.start);
  if (n.rn.cv)
    this.w(',').os().emitAccessChk_invalidSAT(tg(n.rn), n.rn.id.loc.start);
  this.w(')');
};
