this.hasLiquid = function(name) { 
  return this.hasLiquid_m(_m(name));
};

this.accessLiquid = function(targetScope, targetName, createNew) {
  var liquidSource = targetScope;
  if (liquidSource.isAnyFnHead())
    liquidSource = liquidSource.funcBody;

  var liquid = liquidSource.getLiquid(targetName, createNew);
  liquid.trackScope(this, targetScope);
  return liquid;
};

// NOTE: createNew will create a new entry anyway
this.getLiquid = function(name, createNew) {
  ASSERT.call(this, !this.isAnyFnHead(),
    'it is not valid to ask fn-head for a liquid');

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
  return this.liquidDefs.has(mname);
};

this.findLiquid = function(name) {
  var fullName = _full(this.id, name);
  return this.liquidDefs.has(fullName) ?
    this.liquidDefs.get(fullName) : null;
};
