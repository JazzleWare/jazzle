this.absorbIndirect = function(anotherRef) {
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  this.indirect += anotherRef.total();
  if (anotherRef.scope.isConcrete())
    this.lors.push(anotherRef.scope);
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);

  anotherRef.parent = this;
};

this.resolve = function() {
  ASSERT.call(this, !this.resolved,
    'this ref has already been resolved actually');
  this.resolved = true;
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
    this.lors.push(anotherRef.scope);
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);
  anotherRef.parent = this;
};
