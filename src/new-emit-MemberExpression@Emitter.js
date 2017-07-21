Emitters['MemberExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.eH(n.object, flags, false);
  if (n.computed)
    this.w('[').eA(n.property, EC_NONE, false).w(']');
  else
    this.dot().writeIdName(n.property);
  this.emc(cb, 'aft');
  return true;
};

this.emitSAT_mem = Emitters['MemberExpression'];
