Emitters['ArrayExpression'] =
function(n, flags, isStmt) {
  var cb = n['#c'];
  var si = n['#si'];
  var hasParen = false;
  if (si >= 0) {
    hasParen = flags & EC_NEW_HEAD;
    hasParen && this.w('(');
    this.emc(cb, 'bef');
    this.jz('arr').w('(');
  } else
    this.writeComments(cb, 'bef');

  this.emitElems(n.elements, true, cb.holes);

  si >= 0 && this.w(')');

  this.emc(cb, 'aft');
  hasParen && this.w(')');

  isStmt && this.w(';');
  return true;
};
