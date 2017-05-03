function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);
  this.ch = [];
}

ParenScope.prototype = createObj(Scope.prototype);
