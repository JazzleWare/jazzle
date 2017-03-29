this.hasLiquid = function(name) { 
  return this.hasLiquid_m(_m(name));
};

this.accessLiquid = function(targetScope, targetName, createNew) {
  var liquid = targetScope.getLiquid(targetName, createNew);
  liquid.trackScope(this);
  return liquid;
};

this.getLiquid = function(name, createNew) {
  var fullName = _full(this.id, name),
      scs = this.scs;

  if (createNew) {
    var num = 0, newName = name;
    while (scs.liquidDefs.has(fullName)) {
      num++;
      newName = name + "" + num;
      fullName =_full(this.id, newName);
    }
    return scs.liquidDefs.set(
      fullName,
      new Liquid(this, newName).i(name)
    );
  }
 
  if (scs.liquidDefs.has(fullName))
    return scs.liquidDefs.get(fullName);

  return scs.liquidDefs.set(
    fullName,
    new Liquid(this, name)
  );
};

this.hasLiquid_m = function(mname) {
  return this.liquidRefs.has(mname);
};
