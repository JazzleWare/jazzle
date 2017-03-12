function FuncHeadScope(sParent, st) {
  Scope.call(this, sParent, st|ST_HEAD);
  this.paramList = [];
  this.firstNonSimple = null;
  this.scopeName = "";
  this.firstDup = null;
  this.firstEvalOrArguments = null;
  this.mode |= SM_INARGS;
  this.paramMap = {};
}

