this.acceptsName_m = function(mname, acceptMode) {
  if (this.isScript() || this.isModule())
    return this.acceptsName_m_script(mname, acceptMode);
  if (this.isAnyFnBody())
    return this.acceptsName_m_fn(mname, acceptMode);

  ASSERT.call(this, false,
    '<'+this.typeString()+'> unsupported');
};

this.acceptsName_m_script = function(mname, m) {
  ASSERT.call(this, m === ACC_DECL,
    'a script scope will only respond to <accept-decl> requests, no <accept-refs>');

  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames_script();

  if (this.containsSynthName_m(mname))
    return false;

  return true;
};

this.acceptsName_m_fn = function(mname, m) {
  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames_fn();

  var argList = this.funcHead;

  if (this.containsSynthName_m(mname))
    return false;

  if (argList.hasScopeName_m(mname))
    return false;

  if (name === _m('arguments')) {
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
    var ref = argList.findRef_m(mname);
    if (ref && !ref.resolved)
      return false;
  }

  return true;
};

this.acceptsName = function(name, acceptMode) {
  return this.acceptsName_m(_m(name), acceptMode);
};
