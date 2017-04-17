function ParenScope(sParent) {
  Scope.call(this, sParent, ST_PAREN);
}

ParenScope.prototype = createObj(Scope.prototype);
