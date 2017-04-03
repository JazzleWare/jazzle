this.absorbIndirect = function(anotherRef) {
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  this.indirect += anotherRef.total();
  if (anotherRef.scope.isConcrete())
    this.lors.push(
      anotherRef.scope.isAnyFnHead() ?
      anotherRef.scope.funcBody :
      anotherRef.scope
    );
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);

  anotherRef.parent = this;
//if (this.resolved && anotherRef.scope.isHoistable())
//  this.decl.useTZ();
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
  if (anotherRef.scope.isConcrete())
    this.lors.push(
      anotherRef.scope.isAnyFnHead() ? 
      anotherRef.scope.funcBody :
      anotherRef.scope
    );
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);
  anotherRef.parent = this;
};

this.getDecl = function() {
  if (this.decl)
    return this.decl;
  if (this.parent)
    return this.decl = this.parent.getDecl();
  return null;
};
