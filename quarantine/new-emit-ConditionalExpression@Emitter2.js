Emitters['ConditionalExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, EC_NONE, false);
  this.wm(' ',':',' ').eN(n.alternate, EC_NONE, false);
  hasParen && this.w(')');
  isStmt && this.w(';');
};

this.emitCondTest = function(n, prec, flags) {
  var hasParen = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    hasParen = true;
  }

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.eN(n, false, flags);
  if (hasParen) this.w(')');
};
