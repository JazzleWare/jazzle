Emitters['MemberExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
//this.lw(n.loc.start);
  this.eH(n.object, flags, false);
  this.lw(n['#acloc']);
  if (n.computed)
    this.w('[').eA(n.property, EC_NONE, false).w(']');
  else {
    this.dot().emc(CB(n.property), 'bef');
    this.writeIDName(n.property.name); // TODO: node itself rather than its name's string value
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

this.emitSAT_mem = Emitters['MemberExpression'];
