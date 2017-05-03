Emitters['IfStatement'] =
this.emitIf = function(n, prec, flags) {
  this
    .wm('if',' ','(')
    .eA(n.test, PREC_NONE, EC_NONE)
    .w(')')
    .emitDependentStmt(n.consequent, false);
  if (n.alternate) {
    this.l();
    this.w('else').emitDependentStmt(n.alternate, true);
  }
};
