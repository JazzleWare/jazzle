this.clsMemHandOver_m = function(mname, ref) {
  if (this.isHead())
    return this.parent.refIndirect_m(mname, ref);
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
    return this.getThis(ref);
  ASSERT.call(this, this.parent.isAnyFnHead(),
    'fnbody must have an fn-head parent');
  this.parent.refDirect_m(mname, ref);
};

this.fnHeadHandOver_m = function(mname, ref) {
  if (isArguments(mname))
    return this.getArguments(ref);
  if (this.hasScopeName_m(mname) && !this.isMem())
    return this.scopeName.absorbDirect(ref);
  this.parent.refIndirect_m(mname, ref);
};

this.arrowHandOver_m = function(mname, ref) {
  if (this.isHead())
    this.parent.refIndirect_m(mname, ref);
  else
    this.parent.refDirect_m(mname, ref);
};

this.clsHandOver_m = function(mname, ref) {
  if (isArguments(mname) || isThis(mname))
    return this.parent.refIndirect_m(mname, ref);

  if (this.hasScopeName_m(mname))
    return this.scopeName.absorbDirect(ref);

  return this.parent.refDirect_m(mname, ref);
};

this.handOver_m = function(mname, ref) {
  if (ref.synthTarget === this)
    return this.declareLiquid_m(mname, ref);

  if (this.isArrowComp()) {
    return this.arrowHandOver_m(mname, ref);
  }

  if (this.isClassMem())
    return this.clsMemHandOver_m(mname, ref);

  if (this.isClass())
    return this.clsHandOver_m(mname, ref);

  if (this.isCatchComp()||
     this.isBlock() ||
     this.isLexical() ||
     this.isBare())
    return this.parent.refDirect_m(mname, ref);

  if (this.isScript() || this.isModule()) {
    ASSERT.call(
      this,
      this.parent.isGlobal(),
      'script must have a parent scope of type '+
      'global');
    if (isThis(mname))
      return this.getThis(ref);
    return this.parent.getGlobal_m(mname, ref);
  }

  ASSERT.call(this, this.isAnyFnComp(),
    'the only remaining type should have been fn');

  this.funcHandOver_m(mname, ref);
};

this.funcHandOver_m = function(mname, ref) {
  if (this.isHead())
    return this.fnHeadHandOver_m(mname, ref);
  this.fnBodyHandOver_m(mname, ref);
};
