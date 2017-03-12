Emitters['BinaryExpression'] =
Emitters['LogicalExpression'] =
this.emitBinary = function(n, prec, flags) {
  var o = n.operator;
  if (o === '**')
    return this.emitPow(n, flags);

  var left = n.left,
      right = n.right;

  if (isBinaryExpression(left))
    this.emitLeft(left, o, flags);
  else this.emitBinaryExpressionComponent(left, flags);

  this.s().w(o).s();

  if (isBinaryExpression(right))
    this.emitRight(right, o, EC_NONE);
  else this.emitBinaryExpressionComponent(right, EC_NONE);
};

function isBinaryExpression(n) {
  switch (n.type) {
  case 'BinaryExpression':
  case 'LogicalExpression':
    return true;
  default:
    return false;
  }
}

this.emitBinaryExpressionComponent = function(n, flags) {
  if (n.type === 'UnaryExpression' || n.type === 'UpdateExpression')
    return this.emitAny(n, PREC_NONE, flags);
    
  return this.emitHead(n, PREC_NONE, flags);
};

this.emitRight = function(n, ownerO, flags) {
  var childO = n.operator, paren = false;

  // previous op has higher prec because it has higher prec
  if (bp(childO) < bp(ownerO))
    paren = true;

  // previous op has higher prec because it is the previous op
  else if (bp(childO) === bp(ownerO))
    paren = isLeftAssoc(ownerO);

  if (paren) { flags = EC_NONE; this.w('('); }
  this.emitBinary(n, PREC_NONE, flags);
  if (paren) this.w(')');
};

this.emitLeft = function(n, childO, flags) {
  var ownerO = n.operator, paren = false;
  
  if (bp(childO) > bp(ownerO))
    paren = true;
  else if (bp(childO) === bp(ownerO))
    paren = isRightAssoc(childO);

  if (paren) { flags = EC_NONE; this.w('('); }
  this.emitBinary(n, PREC_NONE, flags);
  if (paren) this.w(')');
};

this.emitPow = function(n, flags) {
  var paren = flags & EC_NEW_HEAD;
  if (paren) this.w('(');
  this.wm('jz','.','e','(')
      .eN(n.left, PREC_NONE, EC_NONE)
      .wm(',',' ')
      .eN(n.right, PREC_NONE, EC_NONE)
      .w(')');
  if (paren) this.w(')');
};
