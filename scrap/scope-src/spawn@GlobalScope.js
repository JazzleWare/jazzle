this.moduleScope = function() {
  return new Scope(this, ST_MODULE);
};

this.scriptScope = function() {
  return new Scope(this, ST_SCRIPT);
};
