this.defaultReceive_m = function(mname, ref) {
  var decl = this.findDecl_m(mname);
  if (decl) decl.absorbRef(ref);
  else
    this.findRef_m(mname, true).absorb(ref);
};

this.receiveRef_m = function(mname, ref) {
  ASSERT.call(this, this.isScript() || this.isModule(),
    'this scope is supposed to have its own custom ref');
  this.defaultReceive_m(mname, ref);
};
