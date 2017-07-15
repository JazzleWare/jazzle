UntransformedEmitters['ucond'] =
function(n, flags, isStmt) {
  return Emitters['ConditionalExpression'].call(this, n, flags, isStmt);
};
