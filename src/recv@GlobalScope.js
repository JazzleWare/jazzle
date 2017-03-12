this.defineGlobal_m = function(mname, ref) {
  var newDecl = null, globalRef = this.findRef_m(mname, true);
  newDecl = new Decl().r(globalRef).n(_u(mname));
  globalRef.absorb(ref);
  globalRef.resolve();
};
  
this.receiveRef_m = function(mname, ref) {
  this.defineGlobal_m(mname, ref);
};
