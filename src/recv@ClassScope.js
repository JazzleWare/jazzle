this.receiveRef_m = function(mname, ref) {
  var decl = null;
  this.findRef_m(mname, true).absorb(ref);
};
