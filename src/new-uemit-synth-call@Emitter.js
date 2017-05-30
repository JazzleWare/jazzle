UntransformedEmitters['call'] = 
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); } 
  if (n.mem !== null)
    this.jz('cm').w('(').eN(n.head, EC_NONE, false)
      .w(',').s().eN(n.mem, EC_NONE, false);
  else
    this.jz('c').w('(').eN(n.head, EC_NONE, false);

  this.w(',').s();
  this.jz('arr').w('(').emitElems(n.list, 0, n.list.length-1 );
  this.w(')').w(')');
  
  hasParen && this.w(')');
  isStmt && this.w(';');

  return true;
};
