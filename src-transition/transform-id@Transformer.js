transform['Identifier'] = function(n, pushTarget, flags) {
  var decl = this.currentScope.findRef_m(_m(n.name)).getDecl();
  var shouldTest = this.currentScope.shouldTest(decl);
  if (shouldTest) {
    decl.useTZ();
    this.accessTZ(decl.ref.scope.scs);
  }

  return this.synth_ResolvedName(n.name, decl, shouldTest); 
} 
