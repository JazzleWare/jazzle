this.shouldTest = function(decl) {
  if (!decl.mightNeedTest())
    return false;
  if (!decl.reached)
    return true;
  if (!this.isAnyFnComp())
    return false;

  var scope = this;
  if (scope.isAnyFnBody())
    scope = scope.funcHead;

  return decl.ref.scope === scope.parent && scope.isDecl();
};
