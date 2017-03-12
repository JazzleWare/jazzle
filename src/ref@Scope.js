this.findRef_m = function(mname, createIfNone) {
  return (
    this.refs.has(mname) ? 
    this.refs.get(mname) :
    createIfNone ?
      this.refs.set(mname, new Ref(this)) :
      null
  );
  
};

this.findRef = function(name, createIfNone) {
  return this.findRef_m(_m(name), createIfNone);
};

this.reference = function(name, prevRef) {
  return this.reference_m(_m(name), prevRef);
};

this.reference_m = function(mname, prevRef) {
  var decl = this.findDecl_m(mname);
  if (decl) {
    if (prevRef)
      decl.absorbRef(prevRef);
    else
      decl.ref.direct.ex++;

    return decl.ref;
  }

  var ref = this.findRef_m(mname, true);
  
  if (prevRef) ref.absorb(prevRef);
  else ref.direct.fw++;

  return ref;
};
