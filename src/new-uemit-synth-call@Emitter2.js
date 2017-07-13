UntransformedEmitters['call'] = 
function(n, flags, isStmt) {
  this.rtt();
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); } 
  if (n.mem !== null)
    this.jz('cm').w('(').eN(n.head, EC_NONE, false)
      .w(',').os().eN(n.mem, EC_NONE, false);
  else
    this.jz('c').w('(').eN(n.head, EC_NONE, false);

  this.w(',').os();
  this.jz('arr').w('(').emitElems(n.list, true);
  this.w(')').w(')');
  
  hasParen && this.w(')');
  isStmt && this.w(';');

  return true;
};
