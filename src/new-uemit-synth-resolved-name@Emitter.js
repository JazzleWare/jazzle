if (false)
UntransformedEmitters['resolved-name'] =
function(n, flags, isStmt) {
  var str = n.target.ref.scope.scopeID+':'+n.target.name;
  str += '#['+n.target.synthName+']';
  if (n.tz) str += '::tz';
  this.w(str);
  isStmt && this.w(';');
  return true;
};

var bes = {};
UntransformedEmitters['resolved-name'] =
function(n, flags, isStmt) {
  return bes[n.bes].call(this, n, flags, isStmt);
};

bes['ex'] = this.emitRName_ex =
bes['sat'] = this.emitRName_SAT =
function(n, flags, isStmt) {
  var hasParen = false;
  var hasZero = false;
  var tv = n.target.isLLINOSA(); // tail v
  var tz = false;

  if (tv)
    hasZero = hasParen = flags & EC_CALL_HEAD;
  if (n.bes === 'ex') {
    ASSERT_EQ.call(this, n.cv, false);
    tz = n.tz;
    if (tz) {
      if (!hasParen) hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
      if (hasZero) hasZero = false;
    }
  }
  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (hasZero) this.wm('0',',')
  else if ( tz) { this.emitAccessChk_tz(n.target); this.w(',').os(); }

  var cb = CB(n.id); this.emc(cb, 'bef');
  this.wt(n.target.synthName, ETK_ID );
  tv && this.v();
  this.emc(cb, 'aft');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

bes['binding'] = this.emitRName_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n), 'rn');
  var cb = CB(n.id); this.emc(cb, 'bef' );
  this.wt(n.target.synthName, ETK_ID );
  this.emc(cb, 'aft');
  return true;
};
