this.emitAssignment_ex =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var cc = false;
  var left = n.left;
  var tz = false;
  var target = null;

  if (isResolvedName(left)) {
    target = left.target;
    tz = left.tz;
    cc = target.isImmutable()
    if (!hasParen)
      hasParen = tz || cc;
  }
  if (hasParen) { this.w('('); flags = EC_NONE; }

  tz && (this.emitAccessChk_tz(target), this.w(',').s());
  cc && (this.emitAccessChk_invalidSAT(target), this.w(',').s());

  this.emitSAT(left, flags);

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

Emitters['AssignmentExpression'] = this.emitAssignment_ex;

Emitters['#SynthAssig'] =
function(n, flags, isStmt) {
  if (n.binding && !n.left.target.isVar() && !n.left.target.isLLINOSA())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

this.emitAssignment_binding =
function(n, flags, isStmt) {
  this.w('var').s().emitRName_binding(n.left);
  this.s().w('=').s();
  if (n.left.target.isLLINOSA())
    this.emitWrappedInV(n.right);
  else
    this.eN(n.right, flags, false);

  this.w(';');
};
