function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);  
  this.scopeName = null;
}
