transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.argumentPrologue = this.synth_ArgAssig(n.params);
  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  var ps = this.setScope(n.scope);
  var ts = this.setTempStack([]);

  if (this.currentScope.isExpr() && this.currentScope.funcHead.scopeName) {
    var scopeName = this.currentScope.funcHead.scopeName;
    var synthName = Scope.newSynthName(scopeName.name, null, scopeName.ref.lors, scopeName);
    if (synthName !== scopeName.name) {
      var l = ps.accessLiquid(ps.scs, scopeName.name, true);
      l.associateWith(scopeName);
    }
    else
      scopeName.setSynthName(scopeName.name);
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

  return n;
};
