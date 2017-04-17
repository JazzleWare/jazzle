this.hasScopeName_m = function(mname) {
  return this.scopeName &&
    this.scopeName.name === _u(mname); 
};

this.setScopeName = function(name) {
  ASSERT.call(this, !this.scopeName,
    'this scope has already got a name');
  this.scopeName =
    new Decl().m(DM_SCOPENAME)
              .r(new Ref(this))
              .n(name);

  return this.scopeName;
};
