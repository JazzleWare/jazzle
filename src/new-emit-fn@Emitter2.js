this.emitExprFn =
function(n, flags, isStmt) {
  var hasParen = flags & EC_START_STMT;
  var raw = n.fun;
  var scope = raw['#scope'];
  var scopeName = scope.scopeName;
  var lonll = scope.getNonLocalLoopLexicals();
  var isRenamed = scopeName && scopeName.name !== scopeName.synthName;
  var hasWrapper = isRenamed || lonll;
  if (hasWrapper) {
    if (!hasParen)
      hasParen = flags & EC_NEW_HEAD;
  }

  if (hasParen) { this.w('('); flags = EC_NONE; }
  if (hasWrapper) {
    this.wt('function', ETK_ID).w('(');
    lonll && this.wsndl(lonll);
    this.w(')').s().w('{').i().l();
    if (isRenamed)
      this.w('var').onw(wcb_afterVar).wt(scopeName.synthName, ETK_ID).wm('','=','');
    else
      this.wm('return').onw(wcb_afterRet);
  }
  this.emitTransformedFn(n);
  if (hasWrapper) {
    this.w(';');
    if (isRenamed)
      this.l().w('return').onw(wcb_afterRet).wt(scopeName.synthName, ETK_ID).w(';');
    this.u().l().wm('}','(');
    lonll && this.wsndl(lonll);
    this.w(')');
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
};
