this.acceptsName_m = function(mname, m, o) {
  if (this.synthNamesUntilNow === null)
    this.bootSynthesis();

  var argList = this.funcHead;

  if (this.containsSynthName_m(mname))
    return false;

  if (mname === _m('arguments')) {
    if (m === ACC_REF)
      return false;
    if (this.firstNonSimple !== null)
      return false;

    // unnecessary because it has been actually handled at if (m === ACC_REF)
    var a = this.findDecl('arguments');
    if (a && a.ref.indirect)
      return false;
  }

  var decl =
    this.findDecl_m(mname) ||
    this.funcHead.findDecl_m(mname) ||
    (this.funcHead.scopeName && _m(this.funcHead.scopeName.name) === mname && this.funcHead.scopeName);

  if (decl === this.funcHead.scopeName) {
    if (this.isExpr() && o === decl) return true;
    if (this.isDecl() && o === decl) {
      if (decl.isLexical() && decl.ref.scope.insideLoop() && decl.ref.indirect)
        return false;
    }
  }

  if (m === ACC_REF && this.isMem() && this.funcHead.scopeName && mname === _m(this.funcHead.scopeName.name))
    return false;
//if (m === ACC_DECL) {
//  var ref = argList.findRef_m(mname);
//  if (ref && !ref.resolved)
//    return false;
//}

  return true;
};


