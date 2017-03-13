this.receiveRef_m = function(mname, ref) {
  var decl = 
    isArguments(mname) ? this.getArguments() :
    isCalledSuper(mname) ? this.getCalledSuper() :
    isMemSuper(mname) ? this.getMemSuper() :
    isNewTarget(mname) ? this.getNewTarget() :
    isLexicalThis(mname) ? this.getLexicalThis() :
    null;

  if (decl)
    decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};
