this.addFunc = function(name, resolvedFn) {
  var fnList = this.getFuncList(name);
  fnList.push(resolvedFn);
};

this.getFuncList_m = function(mname) {
  return this.funcDecls.has(mname) ?
    this.funcDecls.get(mname) :
    this.funcDecls.set(mname, []);
};

this.getFuncList = function(name) {
  return this.getFuncList_m(_m(name));
};
