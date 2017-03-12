this.findCatchVar_m = function(mname) {
  var varDecl = this.findDecl_m(mname);
  if (varDecl && varDecl.isCatchVar())
    return varDecl;

  return null;
};
