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
    this.wm('function','(');
    lonll && this.wsndl(lonll);
    this.w(')').s().w('{').i().l();
    if (isRenamed)
      this.wm('var',' ',scopeName.synthName,' ','=',' ');
    else
      this.wm('return').noWrap().s();
  }
  this.emitTransformedFn(n);
  if (hasWrapper) {
    this.w(';');
    if (isRenamed)
      this.l().w('return').noWrap().s().w(scopeName.synthName).w(';');
    this.u().l().wm('}','(');
    lonll && this.wsndl(lonll);
    this.w(')');
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
};
