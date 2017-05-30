Emitters['ArrayExpression'] =
function(n, flags, isStmt) {
  var c0 = this.sc("");
  var hasRest = this.emitElems(n.elements, 0, n.elements.length-1);
  c0 = this.sc(c0);
  if (hasRest)
    this.jz('arr').w('(').ac(c0).w(')');
  else
    this.w('[').ac(c0).w(']');
  isStmt && this.w(';');
  return true;
};
