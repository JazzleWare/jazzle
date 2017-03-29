this.acceptsName_m = function(mname, m) {
  if (this.synthNamesUntilNow === null)
    this.calculateBaseSynthNames();

  var argList = this.funcHead;

  if (this.containsSynthName_m(mname))
    return false;

  if (argList.hasScopeName_m(mname))
    return false;

  if (mname === _m('arguments')) {
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


