function CatchHeadScope(sParent) {
  Scope.call(this, sParent, ST_CATCH|ST_HEAD);

  this.paramsAreSimple = false;
  this.synthParamName = null;
}

