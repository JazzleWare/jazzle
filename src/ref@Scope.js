this.refDirect_m = 
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  if (childRef === null) {
    ref.d++;
    return ref;
  }

  ref.absorbDirect(childRef);
  return ref;
};

this.findRefU_m = this.fRo_m =
function(mname) {
  return this.refs.has(mname) ? 
    this.refs.get(mname) : null;
};

this.findRefAny_m = this.fRa_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    return ref;

  var tdecl = this.findDeclOwn_m(mname); // exclude inner vars
  if (tdecl)
    return tdecl.ref;

  return null;
};

this.removeRefU_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    this.insertRef_m(mname, null);
  else
    ASSERT.call(this, !this.findDeclOwn_m(mname), 'unresolved ref has a decl with the same name?!');

  return ref;
};

this.rocRefU_m =
function(mname) {
  var ref = this.removeRefU_m(mname);
  if (!ref)
    ref = new Ref(this);

  return ref;
};

this.focRefAny_m = this.focRa_m =
function(mname) {
  var ref = this.findRefAny_m(mname);
  if (!ref) {
    ref = new Ref(this);
    this.insertRef_m(mname, ref);
  }
  return ref;
};

this.insertRef_m =
function(mname, ref) {
  this.refs.set(mname, ref);
};

this.refIndirect_m =
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  ASSERT.call(this, childRef !== null,
    'childRef is not allowed to be null when in refIndirect');

  ref.absorbIndirect(childRef);
  return ref;
};
