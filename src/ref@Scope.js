this.refDirect_m = 
function(mname, childRef) {
  var ref = this.focRef_m(mname);
  if (childRef === null) {
    ref.d++;
    return ref;
  }

  ref.absorbDirect(childRef);
  return ref;
};

this.focRef_m =
function(mname) {
  var ref = this.findRef_m(mname);
  if (!ref) {
    ref = new Ref(this);
    this.insertRef_m(mname, ref);
  }
  return ref;
};

this.findRef_m =
function(mname) {
  return this.refs.has(mname) ? 
    this.refs.get(mname) : null;
};

this.insertRef_m =
function(mname, ref) {
  this.refs.set(mname, ref);
};
