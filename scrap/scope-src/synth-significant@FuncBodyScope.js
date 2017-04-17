this.hasSignificantRef = function(ref) {
  if (ref.resolved)
    return false;

  if (this.isAnyFnBody() && 
    ref.parent.scope === this.funcHead)
    return false;

  var decl = ref.getDecl();
  if (decl.isActuallyLiquid())
    return false;

  if (decl.isInsignificant())
    return false;

  if (decl.ref.scope === this.funcHead)
    return false;

  ASSERT.call(this, decl.ref.scope !== this,
    'fn-body must not have an unresolved own decl');

  if (decl === this.funcHead.scopeName) {
    if (this.isExpr())
      return false;
    ASSERT.call(this, this.isDecl(),
      'only an fnexpr requires a resolvable name');
    return false;
  }

  return true;
};
