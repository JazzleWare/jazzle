Emitters['WhileStatement'] =
function(n, flags, isStmt) {
  ;
  this.wt('while', ETK_ID).wm('','(').eA(n.test, EC_NONE, false).w(')').emitBody(n.body);
  return true;
};
