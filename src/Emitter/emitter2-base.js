
this.emitAny =
function(n, flags, isStmt) {
  var emitters = this.emitters, t = n.type;
  if (t in emitters)
    return emitters[t].call(this, n, flags, isStmt );

  this.err('unknown.node');
};

this.emitHead =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt); };

this.emitNonSeq =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_NON_SEQ, isStmt); };

this.emitNewHead =
function(n, flags, isStmt) {
  return this.emitHead(n, EC_NEW_HEAD, false);
};

this.emitCallHead =
function(n, flags, isStmt) {
  return this.emitHead(n, flags|EC_CALL_HEAD, false);
};

