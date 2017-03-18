this.receiveRef_m = function(mname, ref) {
  return this.defaultRecv(mname, ref);
};

this.handOver_m = function(mname, ref) {
  return this.parent.reference_m(mname, ref);
};
