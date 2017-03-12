this.resolve = function() {
  ASSERT.call(this, !this.resolved,
    'this ref has already been resolved actually');
  this.resolved = true;
  return this;
};

this.total = function() {
  return this.indirect.total() + this.direct.total();
};

this.absorb = function(anotherRef) {
  ASSERT.call(this, !this.resolved,
    'a resolved reference must absorb through its decl');
  ASSERT.call(this, !anotherRef.resolved,
    'absorbing a reference that has been resolved is not a valid action');
  var fromScope = anotherRef.scope;
  if (fromScope.isIndirect()) {
    if (fromScope.isHoistable())
      this.indirect.fw += anotherRef.total();
    else {
      this.direct.fw += anotherRef.direct.fw;
      this.indirect.fw += anotherRef.indirect.fw;
    }
  }
};
