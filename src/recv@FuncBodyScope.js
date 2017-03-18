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

this.handOver_m = function(mname, ref) {
  var decl = 
    isArguments(mname) && !this.funcHead.findDecl_m(mname) ? this.getArguments(ref) :
    isCalledSuper(mname) ? this.getCalledSuper(ref) :
    isMemSuper(mname) ? this.getMemSuper(ref) :
    isNewTarget(mname) ? this.getNewTarget(ref) :
    isLexicalThis(mname) ? this.getLexicalThis(ref) :
    null;

  if (!decl)
    this.parent.reference_m(mname, ref);
};
