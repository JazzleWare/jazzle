this.resolve = function() {
  ASSERT.call(this, !this.resolved,
    'this ref has already been resolved actually');
  this.resolved = true;
  return this;
};

this.total = function() {
  return this.indirect + this.direct;
};

this.absorb = function(anotherRef) {
//ASSERT.call(this, !this.resolved,
//  'a resolved reference must absorb through its decl');
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  var fromScope = anotherRef.scope;
  if (fromScope.isIndirect())
    this.indirect += anotherRef.total();
  else {
    this.direct += anotherRef.direct;
    this.indirect += anotherRef.indirect;
  }

  if (fromScope.isConcrete())
    this.lors.push(fromScope);
  if (anotherRef.lors.length)
    this.lors = this.lors.concat(anotherRef.lors);
};
