
UntransformedEmitters['ucond'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef');
  Emitters['ConditionalExpression'].call(this, n, flags, isStmt);
  this.emc(cb, 'aft');
};

