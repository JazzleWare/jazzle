UntransformedEmitters['assig-list'] =
function(n, flags, isStmt) {
  ;
  if (isStmt)
    return this.emitStmtList(n.list);

  var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
  if (hasParen) { this.w('('); flags &= EC_IN; }
  this.emitCommaList(n.list, flags);
  hasParen && this.w(')');
  return true;
};
