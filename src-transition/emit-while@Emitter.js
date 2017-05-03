Emitters['WhileStatement'] = function(n, prec, flags) {
  this.wm('while',' ','(').eA(n.test, PREC_NONE, EC_NONE)
      .w(')').emitDependentStmt(n.body, false);
};
