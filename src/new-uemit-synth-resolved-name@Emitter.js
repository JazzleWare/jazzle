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
  if (n.target.isGlobal())
    this.lw(n.id.loc.start);
  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (hasZero) this.wm('0',',')
  else if ( tz) {
    this.emitAccessChk_tz(n.target, n.id.loc.start);
    this.w(',').os();
  }

  var cb = CB(n.id); this.emc(cb, 'bef');

//var ni = this.smSetName(n.id.name);
  this.wt(n.target.synthName, ETK_ID );
  tv && this.v();
//this.lw(n.id.loc.end);
//this.namei_cur = ni;

  this.emc(cb, 'aft');
  hasParen && this.w(')');
//tz && this.lw(n.id.loc.end);
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
