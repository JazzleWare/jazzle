this.emitBLE =
Emitters['LogicalExpression'] =
Emitters['BinaryExpression'] =
function(n, flags, isStmt) {

  var cb = CB(n);
  this.emc(cb, 'bef' );

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

  o === '+' && this.lw(n['#o']);
  this.wm('',o);

  switch (n.operator) {
  case '/':
    this.onw(wcb_DIV_b);
    break;
  case '+':
    this.onw(wcb_ADD_b);
    break;
  case '-':
    this.onw(wcb_MIN_b);
    break;
  default:
    this.os();
    break;
  }

  if (isBLE(right))
    this.emitRight(right, o, EC_NONE);
  else
    this.emitBLEP(right, EC_NONE);

  hasParen && this.w(')');

  this.emc(cb, 'aft');

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

  var cb = CB(n);
  this.emcim(cmn_erase(cb, 'bef'));
  var aft = cmn_erase(cb, 'aft');
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
  this.emcim(aft );
};

this.emitLeft =
function(n, o, flags) {
  var hasParen = false;
  var rp = bp(o), lp = bp(n.operator);

  if (lp<rp)
    hasParen = true;
  else if (lp === rp)
    hasParen = isRA(lp) ;

  var cb = CB(n);
  this.emcim(cmn_erase(cb, 'bef'));
  var aft = cmn_erase(cb, 'aft');
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitBLE(n, flags, false);
  hasParen && this.w(')');
  this.emcim(aft );
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
  this.jz('ex').w('(').eN(n.left).w(',').os().eN(n.right).w(')');
  hasParen && this.w(')');

  this.emc(CB(n), 'aft');
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
