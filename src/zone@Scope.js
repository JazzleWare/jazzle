this.shouldTest = function(decl) {
  if (decl.isVName() || decl.isFunc() || decl.isGlobal() || decl.isScopeName())
    return false;
  if (!decl.reached)
    return true;

  var scope = this.scs;
  if (!scope.isAnyFnComp())
    return false;

  if (scope.isAnyFnBody())
    scope = scope.funcHead;

  return decl.ref.scope === scope.parent && scope.isDecl();
};
