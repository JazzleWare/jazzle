this.emitHead =
function(n, flags, isStmt) {
  return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt);
};

this.eH = function(n, flags, isStmt) {
  this.emitHead(n, flags, isStmt);
  return this;
};

this.emitAny = function(n, flags, isStmt) {
  if (HAS.call(Emitters, n.type))
    return Emitters[n.type].call(this, n, flags, isStmt);
  this.err('unknow.node');
};

this.eA = function(n, flags, isStmt) {
  this.emitAny(n, flags, isStmt); 
  return this; 
};

this.emitNonSeq = function(n, flags, isStmt) {
  this.emitAny(n, flags|EC_NON_SEQ, isStmt);
};

this.eN = function(n, flags, isStmt) {
  this.emitNonSeq(n, flags, isStmt);
  return this;
};

this.emitNewHead = function(n) {
  return this.eH(n, EC_NEW_HEAD, false);
};

this.emitCallHead = function(n, flags) {
  return this.eH(n, flags|EC_CALL_HEAD, false);
};
