this.spCreate_global =
function(mname, ref) {
  var newDecl = this.findDeclOwn_m(mname);
  ASSERT.call(this, !newDecl && !this.findDeclAny_m(mname),
    'global scope has already got this name: <'+_u(mname)+'>');

  newDecl = new Decl().t(DT_GLOBAL).r(ref).n(_u(mname));
  this.insertDecl_m(mname, newDecl);

  return newDecl;
};
