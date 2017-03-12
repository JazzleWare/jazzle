function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);

  this.paramList = [];
  this.firstDup = null;
  this.firstNonSimple = null;
  this.paramMap = {};
}

ParenScope.prototype = createObj(Scope.prototype);
