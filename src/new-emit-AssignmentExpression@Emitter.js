this.emitAssignment_ex =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var cc = false;
  var left = n.left;
  var tz = false;
  var target = null, cb = n['#c'];

  if (isResolvedName(left)) {
    target = left.target;
    tz = left.tz;
    cc = left.cv;
    if (!hasParen)
      hasParen = tz || cc;
  }
  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.emc(cb, 'bef');
  tz && (this.emitAccessChk_tz(target), this.w(',').os());
  cc && (this.emitAccessChk_invalidSAT(target), this.w(',').os());

  this.emitSAT(left, flags);

  this.os();
  if (n.operator === '**=') {
    ASSERT.call(this, isResolvedName(n.left), 'not rn');
    this.w('=').os().jz('ex')
        .w('(').eN(n.left, EC_NONE, false)
        .w(',').os().eN(n.right, flags & EC_IN, false)
        .w(')');
  }
  else {
    this.w(n.operator).os();
    this.eN(n.right, flags & EC_IN, false);
  }

  this.emc(cb, 'aft');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

Emitters['AssignmentExpression'] =
function(n, flags, isStmt) {
  return this.emitAssignment_ex(n, flags, isStmt);
};

Emitters['#SynthAssig'] =
function(n, flags, isStmt) {
  if (n.binding && !n.left.target.isVar() && !n.left.target.isLLINOSA())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

this.emitAssignment_binding =
function(n, flags, isStmt) {
  var cb = n['#c']; this.emc(cb, 'bef');
  this.w('var').onw(wcb_afterVar).os().emitRName_binding(n.left);
  this.os().w('=').os();
  if (n.left.target.isLLINOSA())
    this.emitWrappedInV(n.right);
  else
    this.eN(n.right, flags, false);

  this.w(';');
  this.emc('aft');
};
