function ClassScope(sParent, sType) {
  Scope.call(this, sParent, sType|ST_CLS);
  
  this.synthCLSPName = "";
  this.synthSuperName = "";
  this.synthCLSName = "";
  this.scopeName = null;

  this.special = { scall: null, smem: null };
}
