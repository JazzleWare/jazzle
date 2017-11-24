
UntransformedEmitters['cvtz'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('o').w('(').eN(n.value);
  if (tzc(n.rn))
    this.w(',').os().emitAccessChk_tz(tg(n.rn), n.rn.loc.start);
  if (cvc(n.rn))
    this.w(',').os().emitAccessChk_invalidSAT(tg(n.rn), n.rn.loc.start);

  this.w(')');
};

