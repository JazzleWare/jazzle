this.emitBLE =
Emitters['LogicalExpression'] =
Emitters['BinaryExpression'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (o === '**')
    return this.emitPow(n, flags, isStmt);

  var left = n.left, right = n.right;
  if (isBLE(left))
    this.emitLeft(left, o, flags);
  else
    this.emitBLEP(left, flags);

  this.wm('',o);

  switch (n.operator) {
  case '/':
    this.onw(wcb_DIV);
    break;
  case '+':
    this.onw(wcb_ADD);
    break;
  case '-':
    this.onw(wcb_MIN);
    break;
  }

  this.os();

  if (isBLE(right))
    this.emitRight(right, o, EC_NONE);
  else
    this.emitBLEP(right, EC_NONE);

  hasParen && this.w(')');
  isStmt && this.w(';');
  return true; // something was actually emitted
};

this.emitRight = 
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(n.operator), lp = bp(o);

  if (lp>rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isLA(rp);

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
};

this.emitLeft =
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(o), lp = bp(n.operator);

  if (lp<rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isRA(lp) ;

  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
};

this.emitBLEP =
function(n, flags) {
  switch (n.type) {
  case 'UnaryExpression': // it has a higher pr than any other op
  case 'UpdateExpression':
    return this.emitAny(n, flags, false);
  }
  return this.emitHead(n, flags, false);
};

this.emitPow =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.jz('ex').w('(').eN(n.left).w(',').s().eN(n.right).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

function isBLE(n) {
  switch (n.type) {
  case 'BinaryExpression':
  case 'LogicalExpression':
    return true;
  default:
    return false;
  }
}
