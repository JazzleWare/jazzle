if (false) {
this.refDirect = function(name, ref) {
  return this.refDirect_m(_m(name), ref);
};

this.refIndirect = function(name, ref) {
  return this.refIndirect_m(_m(name), ref);
};

this.findRef = function(name, createIfNone) {
  return this.findRef_m(_m(name), createIfNone);
};
}

this.refDirect_m = function(mname, anotherRef) {
  var ref = this.findRef_m(mname, true, anotherRef && anotherRef.synthTarget !== null);
  if (anotherRef === null) ref.direct++;
  else ref.absorbDirect(anotherRef);
};

this.refIndirect_m = function(mname, ref) {
  this.findRef_m(mname, true, ref.synthTarget !== null).absorbIndirect(ref);
};

this.findRef_m = function(mname, createIfNone, isLiquid) {
  var target = isLiquid ? this.liquidRefs : this.refs;
  return (
    target.has(mname) ? 
    target.get(mname) :
    createIfNone ?
      target.set(mname, new Ref(this)) :
      null
  );
  
};
