  import {ASSERT} from '../other/constants.js';
  import Ref from '../Ref/cls.js';
  import {cls} from './cls.js';

cls.refDirect_m = 
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  if (childRef === null) {
    ref.d++;
    return ref;
  }

  ref.absorbDirect(childRef);
  return ref;
};

cls.findRefU_m = cls.fRo_m =
function(mname) {
  return this.refs.has(mname) ? 
    this.refs.get(mname) : null;
};

cls.findRefAny_m = cls.fRa_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    return ref;

  var tdecl = this.findDeclOwn_m(mname); // exclude inner vars
  if (tdecl === null) {
    if (this.isAnyFn())
      tdecl = this.findParam_m(mname);
    else if (this.isCatch() && this.args.has(mname))
      tdecl = this.args.get(mname);
  }

  if (tdecl)
    return tdecl.ref;

  return null;
};

cls.removeRefU_m =
function(mname) {
  var ref = this.findRefU_m(mname);
  if (ref)
    this.insertRef_m(mname, null);
  else
    ASSERT.call(this, !this.findDeclOwn_m(mname), 'unresolved ref has a decl with the same name?!');

  return ref;
};

cls.rocRefU_m =
function(mname) {
  var ref = this.removeRefU_m(mname);
  if (!ref)
    ref = new Ref(this);

  return ref;
};

cls.focRefAny_m = cls.focRa_m =
function(mname) {
  var ref = this.findRefAny_m(mname);
  if (!ref) {
    ref = new Ref(this);
    this.insertRef_m(mname, ref);
  }
  return ref;
};

cls.insertRef_m =
function(mname, ref) {
  this.refs.set(mname, ref);
};

cls.refIndirect_m =
function(mname, childRef) {
  var ref = this.focRefAny_m(mname);
  ASSERT.call(this, childRef !== null,
    'childRef is not allowed to be null when in refIndirect');

  ref.absorbIndirect(childRef);
  return ref;
};


