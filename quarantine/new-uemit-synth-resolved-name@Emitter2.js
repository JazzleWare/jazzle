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
  if (tv)
    hasZero = hasParen = flags & EC_CALL_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  hasZero && this.wm('0',',');
  this.w(n.target.synthName);
  tv && this.v();
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

bes['binding'] = this.emitRName_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n), 'rn');
  return this.w(n.target.synthName), true;
};
