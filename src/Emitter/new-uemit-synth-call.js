
UntransformedEmitters['call'] = 
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  var cb = CB(n); this.emc(cb, 'bef');
  if (hasParen) { this.w('('); } 
  if (n.mem !== null) {
    this.jz('cm');
    this.sl(n['#argloc']);
    this.w('(').eN(n.head, EC_NONE, false).w(',').os();
    var m = n.mem;
    m.type === 'Super' ? this.w(m['#liq'].synthName) : this.eN(m, EC_NONE, false) ;
  }
  else {
    this.jz('c');
    this.sl(n['#argloc']);
    this.w('(');
    if (n.head.type === 'Super') this.w(n.head['#liq'].synthName);
    else this.eN(n.head, EC_NONE, false);
  }

  this.w(',').os();
  this.jz('arr').w('(').emitElems(n.list, true, cb);
  this.w(')').w(')');
  
  hasParen && this.w(')');
  isStmt && this.w(';');

  return true;
};

