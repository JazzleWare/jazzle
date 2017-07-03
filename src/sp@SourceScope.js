this.spCreate_global =
function(mname, ref) {
  var newDecl = this.findGlobal_m(mname);
  ASSERT.call(this, !newDecl && !this.findDeclAny_m(mname),
    'global scope has already got this name: <'+_u(mname)+'>');

  ref.scope = this.parent;
  newDecl = new Decl().t(DT_GLOBAL).r(ref).n(_u(mname));
  this.insertGlobal_m(mname, newDecl);

  return newDecl;
};

this.insertGlobal_m =
function(mname, global) {
  ASSERT.call(this, global.isGlobal(), 'global');
  return this.parent.defs.set(mname, global);
};

this.findGlobal_m =
function(mname) {
  return this.parent.defs.has(mname) ?
    this.parent.defs.get(mname) : null;
};
