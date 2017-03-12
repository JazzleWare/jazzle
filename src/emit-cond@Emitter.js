Emitters['ConditionalExpression'] = function(n, prec, flags) {
  this.emitCondTest(n.test, flags);
  this.wm(' ','?',' ').eN(n.consequent, PREC_NONE, EC_NONE);
  this.wm(' ',':',' ').eN(n.alternate, PREC_NONE, EC_NONE);
};

this.emitCondTest = function(n, prec, flags) {
  var paren = false;
  switch (n.type) {
  case 'AssignmentExpression':
  case 'ConditionalExpression':
    paren = true;
  }

  if (paren) { this.w('('); flags = EC_NONE; }
  this.eN(n, PREC_NONE, flags);
  if (paren) this.w(')');
};
