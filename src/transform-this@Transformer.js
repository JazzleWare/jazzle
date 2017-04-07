transform['ThisExpression'] = function(n, pushTarget, isVal) {
  var thisRef = this.currentScope.findRef_m(RS_THIS), decl = thisRef.getDecl();
  return this.synth_ResolvedThis(decl, decl.ref.scope === this.currentScope);
};
