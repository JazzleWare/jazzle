this.clsMemHandOver_m = function(mname, ref) {
  if (this.isHead())
    return this.parent.refIndirect(mname, ref);
  if (isSupMem(mname))
    return this.cls()
               .getSupMem()
               .absorbIndirect(ref);
  if (isSupCall(mname))
    return this.cls()
               .getSupCall()
               .absorbIndirect(ref);
  return this.funcHandOver_m(mname, ref);
};

this.fnBodyHandOver_m = function(mname, ref) {
  if (isThis(mname))
    return this.getThis()
               .absorbDirect(ref);
  ASSERT.call(this, this.parent.isAnyFnHead(),
    'fnbody must have an fn-head parent');
  this.parent.refDirect(mname, ref);
};

this.fnHeadHandOver_m = function(mname, ref) {
  if (isArguments(mname))
    return this.getArguments()
               .absorbDirect(ref);
  if (this.hasScopeName_m(mname))
    return this.scopeName.absorbDirect(ref);
  this.parent.refIndirect(mname, ref);
};

this.arrowHandOver_m = function(mname, ref) {
  if (this.isHead())
    this.parent.refIndirect(mname, ref);
  else
    this.parent.refDirect(mname, ref);
};

this.clsHandOver_m = function(mname, ref) {
  if (isArguments(mname) || isThis(mname))
    return this.parent.refIndirect(mname, ref);
  return this.parent.refDirect(mname, ref);
};

this.handOver_m = function(mname, ref) {
  if (this.isArrowComp()) {
    return this.arrowHandOver_m(mname, ref);
  }

  if (this.isClassMem())
    return this.clsMemHandOver_m(mname, ref);

  if (this.isClass())
    return this.clsHandOver_m(mname, ref);

  if (this.isCatchComp()||
     this.isBlock() ||
     this.isLexical() || this.type === ST_BODY) 
    return this.parent.refDirect_m(mname, ref);

  if (this.isScript() || this.isModule()) {
    ASSERT.call(
      this,
      this.parent.isGlobal(),
      'script must have a parent scope of type '+
      'global');
    return this.parent.getGlobal_m(mname).absorbDirect(ref);
  }

  ASSERT.call(this, this.isAnyFnComp(),
    'the only remaining type should have been fn');

  this.parent.funcHandOver_m(mname, ref);
};

this.funcHandOver_m = function(mname, ref) {
  if (this.isHead())
    return this.fnHeadHandOver_m(mname, ref);
  this.fnBodyHandOver_m(mname, ref);
};
