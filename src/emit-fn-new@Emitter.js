Emitters['FunctionExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_START_STMT,
      altName = false,
      scopeName = n.scope.funcHead.scopeName;

  if (scopeName && scopeName.name !== scopeName.synthName)
    altName = true;

  if (!paren)
    paren = altName && (flags & EC_EXPR_HEAD);

  if (paren) { this.w('('); flags = EC_NONE; }
  if (altName)
    this.wm(scopeName.synthName,' ','=',' ');

  var fnName = n.id ? n.id.name : "";
  this.emitFn(n, fnName, flags);

  paren && this.w(')');
};
