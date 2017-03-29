this.absorbIndirect = function(anotherRef) {
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  this.indirect += anotherRef.total();
  if (anotherRef.scope.isConcrete() && !anotherRef.scope.isAnyFnHead())
    this.lors.push(anotherRef.scope);
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);

  anotherRef.parent = this;
  if (this.resolved && anotherRef.scope.isHoistable())
    this.decl.useTZ();
};

this.resolveTo = function(decl) {
  ASSERT.call(this, !this.resolved,
    'this ref has already been resolved actually');
  this.resolved = true;
  this.decl = decl;
  return this;
};

this.total = function() {
  return this.indirect + this.direct;
};

this.absorbDirect = function(anotherRef) {
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  this.direct += anotherRef.direct;
  this.indirect += anotherRef.indirect;
  if (anotherRef.scope.isConcrete() && !anotherRef.scope.isAnyFnHead())
    this.lors.push(anotherRef.scope);
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);
  anotherRef.parent = this;
  if (anotherRef.synthTarget) {
    if (this.synthTarget === null) {
      this.synthTarget = anotherRef.synthTarget;
      this.idealSynthName = anotherRef.idealSynthName;
    }
    else {
      ASSERT.call(this, this.synthTarget === anotherRef.synthTarget,
        'synth targets have to match for ' + anotherRef.idealSynthName);
      ASSERT.call(this, this.idealSynthName === anotherRef.idealSynthName,
        'current ISN has to match for ' + anotherRef.idealSynthName);
    }
  }
  else
    ASSERT.call(this, !this.synthTarget,
      'a ref with a synthTarget is not allowed to absorb a ref without one');
};

this.getDecl = function() {
  if (this.decl)
    return this.decl;
  if (this.parent)
    return this.decl = this.parent.getDecl();
  return null;
};
