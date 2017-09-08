UntransformedEmitters['cls'] =
function(n, flags, isStmt) {
  this.jz('cls').w('(');
  if (n.cls) {
    ASSERT.call(this, n.target === null, 'cls' ); 
    this.eN(n.cls, EC_NONE, false);     
  }
  else this.w(n.target.synthName);
  n.heritage && this.w(',').os().eN(n.heritage);
  this.w(')');
  isStmt && this.w(';');
};
