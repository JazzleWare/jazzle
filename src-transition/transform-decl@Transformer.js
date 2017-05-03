transform['VariableDeclaration'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformDeclarationWithYield(n, pushTarget, isVal);

  ASSERT.call(this, pushTarget === null, 'pushTarget is not allowed to be non-null');
  pushTarget = [];

  var list = n.declarations, i = 0;
  while (i < list.length) {
    var elem = list[i++], assig = null;
    if (n.kind === 'var') {
      if (!elem.init) continue;
      assig = this.synth_SubAssig(elem.id, elem.init);
    }
    else
      assig = this.synth_DeclAssig(elem.id, elem.init);

    var result = this.transform(assig, pushTarget, false);
    result && pushTarget.push(result);
  }

  return pushTarget.length === 1 ?
    pushTarget[0] : this.synth_Sequence(pushTarget);
};

this.transformDeclName = function(id) {
  var decl = this.currentScope.findDecl_m(_m(id.name));
  return this.synth_ResolvedName(id.name, decl, false);
};
