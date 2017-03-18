this.receiveRef_m = function(mname, ref) {
  var decl = this.findDecl_m(mname) ||
    this.catchArgs.findDecl_m(mname);
  if (decl)
    decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};

this.handOver_m = function(mname, ref) {
  return this.parent.reference_m(mname, ref);
};
