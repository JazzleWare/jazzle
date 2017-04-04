this.hasSignificantRef = function(ref) {
  if (ref.resolved)
    return false;

  var decl = ref.getDecl();
  if (decl.isActuallyLiquid())
    return false;

  if (decl.isInsignificant())
    return false;

  if (decl === this.scopeName) {
    ASSERT.call(this, this.isExpr(),
      'only a fnexpr must have a resolvable name');
    return false;
  }

  return true;
};
