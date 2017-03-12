function CatchBodyScope(sParent) {
  LexicalScope.call(this, sParent, ST_CATCH|ST_BODY);
  
  this.paramList = new SortedObj();
  this.hasSimpleList = true;
  this.catchVarName = "";
}

