Emitters['#SubAssig'] =
Emitters['AssignmentExpression'] =
this.emitAssig = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  var cc = needsConstCheck(n.left);
  if (!paren) { paren = cc; }
  if (paren) { this.w('('); flags = EC_NONE; }
  if (cc)
    this.jz('cc').w('(')
        .w('\'').writeStrWithVal(n.left.name).w('\'')
        .w(')')
        .w(',')
        .s();

  this.emitAssigLeft(n.left, flags);
  this.wm(' ',n.operator,' ');
  this.emitAssigRight(n.right);

  paren && this.w(')');
  isStmt && this.w(';');
};

this.emitAssigLeft = function(n, flags) {
  return this.emitHead(n, false, flags);
};

this.emitAssigRight = function(n) {
  this.eN(n, false, EC_NONE);
};
