Emitters['#SynthAssig'] =
Emitters['AssignmentExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitSAT(n.left, flags);
  this.s();
  if (n.operator === '**=') {
    ASSERT.call(this, isResolvedName(n.left), 'not rn');
    this.w('=').s().jz('ex')
        .w('(').eN(n.left, EC_NONE, false)
        .w(',').s().eN(n.right, flags & EC_IN, false)
        .w(')');
  }
  else {
    this.w(n.operator).s().eN(n.right, flags & EC_IN, false);
  }

  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
