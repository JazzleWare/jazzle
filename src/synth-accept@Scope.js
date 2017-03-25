this.acceptsName = function(name, acceptMode) {
  if (this.isScript() || this.isModule())
    return this.acceptsName_script(name, acceptMode);
  if (this.isAnyFnBody())
    return this.acceptsName_fn(name, acceptMode);

  ASSERT.call(this, false,
    '<'+this.typeString()+'> unsupported');
};

this.acceptsName_script = function(name, m) {
  ASSERT.call(this, m === ACC_DECL,
    'a script scope will only respond to <accept-decl> requests, no <accept-refs>');

  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames_script();

  if (this.containsSynthName(name))
    return false;

  return true;
};

this.acceptsName_fn = function(name, m) {
  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames_fn();

  var argList = this.funcHead;

  if (this.containsSynthName(name))
    return false;

  if (argList.scopeName &&
    name === argList.scopeName.name)
    return false;

  if (name === 'arguments') {
    if (m === ACC_REF)
      return false;
    if (this.firstNonSimple !== null)
      return false;

    // unnecessary
    var a = this.findDecl('arguments');
    if (a && a.ref.indirect)
      return false;
  }

  if (m === ACC_DECL) {
    var ref = argList.findRef(name);
    if (ref && !ref.resolved)
      return false;
  }

  return true;
};
