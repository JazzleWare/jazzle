transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.argumentPrologue = this.synth_ArgAssig(n.params);
  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  var ps = this.setScope(n.scope);
  var ts = this.setTempStack([]);

  this.accessJZ();

  if (this.currentScope.isExpr() && this.currentScope.funcHead.scopeName) {
    var scopeName = this.currentScope.funcHead.scopeName;
    var synthName = Scope.newSynthName(scopeName.name, null, scopeName.ref.lors, scopeName);
    scopeName.setSynthName(synthName);
  }

  this.currentScope.startupSynthesis();

  if (n.argumentPrologue !== null) {
    var hs = this.setScope(this.currentScope.funcHead);
    n.argumentPrologue = this.transform(n.argumentPrologue, null, false);
    this.setScope(hs);
  }

  n.body = this.transform(n.body, null, isVal);
  this.currentScope.endSynthesis();

  this.setScope(ps);
  this.setTempStack(ts);

  if (n.type === 'FunctionDeclaration') {
    n = this.asResolvedFn(n);
    ps.addFunc(n.fn.id.name, n);
  }

  return n;
};

this.asResolvedFn = function(fn) {
  var fnName = fn.id.name;
  return this.synth_ResolvedFn(fn, this.currentScope.findDecl(fnName));
};
