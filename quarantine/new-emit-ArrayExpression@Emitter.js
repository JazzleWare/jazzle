Emitters['ArrayExpression'] =
function(n, flags, isStmt) {
  ;
  var si = n['#si'];
  var hasParen = false;
  if (si >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.jz('arr').w('(');
  }

  this.emitElems(n.elements, true);

  si >= 0 && this.w(')');
  hasParen && this.w(')');

  isStmt && this.w(';');
  return true;
};
