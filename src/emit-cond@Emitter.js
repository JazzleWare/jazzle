Emitters['ConditionalExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, false, EC_NONE);
  this.wm(' ',':',' ').eN(n.alternate, false, EC_NONE);
  paren && this.w(')');
};

this.emitCondTest = function(n, prec, flags) {
  var paren = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    paren = true;
  }

  if (paren) { this.w('('); flags = EC_NONE; }
  this.eN(n, false, flags);
  if (paren) this.w(')');
};
