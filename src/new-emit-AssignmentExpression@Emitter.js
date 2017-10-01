this.emitAssignment_ex =
function(n, flags, isStmt) {
  if (this.bomb(n.left))
    return;
  var hasParen = flags & EC_EXPR_HEAD;
  var cc = false;
  var left = n.left;
  var tz = false;
  var target = null, cb = n['#c'];

//if (isResolvedName(left)) {
//  target = left.target;
//  if (!this.active(target))
//    return this.emitAny(n.right, flags, isStmt);
//  tz = left.tz;
//  cc = left.cv;
//  if (!hasParen)
//    hasParen = tz || cc;
//}
  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.emc(cb, 'bef');
//if (tz)
//  this.emitAccessChk_tz(target, left.id.loc.start), this.w(',').os();
//if (cc) 
//  this.emitAccessChk_invalidSAT(target, left.id.loc.start), this.w(',').os();

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
    if (n.operator === '+=') this.lw(n['#o']);
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
  if (n.binding && !n.left.target.isVar())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

this.emitAssignment_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n.left), 'name');

  var cb = n['#c']; this.emc(cb, 'bef');
  if (!this.active(n.left.target))
    this.emitAny(n.right, flags, false);
  else {
    n.left.target.isLLINOSA() || this.w('var').onw(wcb_afterVar).os();
    this.emitRName_binding(n.left);
    n.left.target.isLLINOSA() && this.wm('.','v');
    this.os().w('=').os();
    this.eN(n.right, EC_NONE, false);
  }
  this.w(';');
  this.emc('aft');
  
  var l = n.left;
  l.target.hasTZCheck && this.os().emitTZCheckPoint(l.target);
};
