Emitters['TryStatement'] = function(n, prec, flags) {
  this.w('try').emitDependentStmt(n.block, false);
  if (n.handler)
    this.l().emitCatchClause(n.handler);
  if (n.finalizer)
    this.l().w('finally').emitDependentStmt(n.finalizer);
};

this.emitCatchClause = function(c) {
  this.wm('catch',' ','(').emitIdentifierWithValue('err');
  this.w(')').emitDependentStmt(c.body);
};
