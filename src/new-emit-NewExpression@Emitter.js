Emitters['NewExpression'] =
function(n, flags, isStmt) {
  this.w('new').s().emitNewHead(n.callee);
  this.w('(').emitCommaList(n.arguments).w(')');

  return true;
};
