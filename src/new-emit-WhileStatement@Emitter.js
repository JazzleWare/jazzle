Emitters['WhileStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt('while', ETK_ID);
  this.emc(cb, 'while.aft') || this.os(); 
  this.w('(').eA(n.test, EC_NONE, false).w(')');
  if (this.active(n['#scope'])) { n['#scope'].inUse = true; this.emitBody(n.body); }
  else this.w(';');
  this.emc(cb, 'aft');
  return true;
};
