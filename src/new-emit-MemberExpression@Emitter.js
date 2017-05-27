Emitters['MemberExpression'] =
function(n, flags, isStmt) {
  this.eH(n.object, flags, false);
  if (n.computed)
    this.w('[').eA(n.property, EC_NONE, false).w(']');
  else
    this.dot().writeIdName(n.property);
  return true;
};

this.emitSAT_mem = Emitters['MemberExpression'];
