this.acceptsName_m = function(mname, m, o) {
  ASSERT.call(this, this.isScript() || this.isModule(),
    '<'+this.typeString()+'> unsupported');
  ASSERT.call(this, m === ACC_DECL,
    'a script scope will only respond to <accept-decl> requests, no <accept-refs>');

  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames();

  if (this.containsSynthName_m(mname))
    return false;

  return true;
};

if (false) {
this.acceptsName = function(name, acceptMode) {
  return this.acceptsName_m(_m(name), acceptMode);
};
}
