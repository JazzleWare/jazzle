Emitters['NewExpression'] =
function(n, flags, isStmt) {
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    this.w('new').s().emitNewHead(n.callee);
    this.w('(').emitCommaList(n.arguments).w(')');
  } else {
    var hasParen = flags & EC_NEW_HEAD;
    if (hasParen) { this.w('('); flags = EC_NONE; }
    this.jz('n').w('(').eN(n.callee, EC_NONE, false).wm(',',' ')
      .jz('arr').w('(').emitElems(n.arguments, 0, n.arguments.length-1);

    this.w(')').w(')');
    hasParen && this.w(')');
  }

  isStmt && this.w(';');
  return true;
};
