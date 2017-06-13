this.spCreate_global =
function(mname, ref) {
  var globalScope = this.parent;
  ASSERT.call(this, globalScope.isGlobal(), 'global');
  return  globalScope.findDeclOwn_m(mname) ||
    globalScope.spCreate_global(mname, ref);
};
