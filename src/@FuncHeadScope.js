function FuncHeadScope(sParent, st) {
  Scope.call(this, sParent, st|ST_HEAD);
  this.liquidDefs = null;

  this.paramList = [];
  this.firstNonSimple = null;
  this.scopeName = null;
  this.firstDup = null;
  this.firstEvalOrArguments = null;
  this.mode |= SM_INARGS;
  this.paramMap = {};
  this.funcBody = null;
}

