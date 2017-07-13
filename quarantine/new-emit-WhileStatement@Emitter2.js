Emitters['WhileStatement'] =
function(n, flags, isStmt) {
  this.wm('while',' ','(').eA(n.test, EC_NONE, false).w(')').emitBody(n.body);
  return true;
};
