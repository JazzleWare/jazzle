this.hasLiquid = function(name) { 
  return this.hasLiquid_m(_m(name));
};

this.accessLiquid = function(targetScope, targetName) {
  targetScope.getLiquid(targetName).trackScope(this);
};

this.getLiquid = function(name) {
  var fullName = _full(this.id, name),
      scs = this.scs;

  if (scs.liquidDefs.has(fullName))
    return scs.liquidDefs.get(fullName);

  return scs.liquidDefs.set(
    fullName,
    new Liquid(this, _u(fullName))
  );
};

this.hasLiquid_m = function(mname) {
  return this.liquidRefs.has(mname);
};
