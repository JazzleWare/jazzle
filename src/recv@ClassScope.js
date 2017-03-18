this.receiveRef_m = function(mname, ref) {
  var decl = null;
  this.findRef_m(mname, true).absorb(ref);
};

this.handOver_m = function(mname, ref) {
  return this.reference_m(mname, ref);
};
