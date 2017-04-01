transform['FunctionExpression'] =
transform['FunctionDeclaration'] = function(n, pushTarget, isVal) {
  if (functionHasNonSimpleParams(n))
    n.body = this.addParamAssigPrologueToBody(n);
  if (n.generator)
    return this.transformGenerator(n, null, isVal);

  var ps = this.setScope(n.scope);
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

  if (this.currentScope.synthNamesUntilNow === null)
    this.currentScope.calculateBaseSynthNames();

  this.currentScope.calculateRefs();

  n.body = this.transform(n.body, null, isVal);
  this.currentScope.synthesizeLiquidsInto(this.currentScope);
  this.setScope(ps);

  return n;
};

this.addParamAssigPrologueToBody = function(fn) {
  var prolog = {
    type: 'ArgsPrologue',
    left: fn.params,
    right: synth_jz_arguments_to_array(),
  };

  // TODO: make it more low-power
  fn.body.body = [prolog].concat(fn.body.body);

  return fn.body;
};
