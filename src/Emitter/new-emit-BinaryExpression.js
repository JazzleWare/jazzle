  import {Emitters} from '../other/globals.js';
  import {CB, cmn_erase} from '../other/util.js';
  import {EC_EXPR_HEAD, EC_NONE, ETK_ID, EC_NEW_HEAD} from '../other/constants.js';
  import {wcb_DIV_b, wcb_ADD_b, wcb_MIN_b, wcb_idNumGuard} from '../other/wcb.js';
  import {bp, isLA, isRA} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.emitBLE =
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

  o === '+' && this.sl(n['#o']);

  switch (o) {
  case '/':
    this.os().w(o).gu(wcb_DIV_b);
    break;
  case '+':
    this.os().w(o).gu(wcb_ADD_b);
    break;
  case '-':
    this.os().w(o).gu(wcb_MIN_b);
    break;
  case 'in':
  case 'instanceof':
    this.bs(); // TODO: if writeToCurrentLine_checked keeps tt intact, we could know what the latest written token has been which helps us decide whether a bs is really necessary
    this.wt(o,ETK_ID).gu(wcb_idNumGuard);
    break;
  default:
    this.wm('',o).os();
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

cls.emitRight = 
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

cls.emitLeft =
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

cls.emitBLEP =
function(n, flags) {
  switch (n.type) {
  case 'UnaryExpression': // it has a higher pr than any other op
  case 'UpdateExpression':
    return this.emitAny(n, flags, false);
  }
  return this.emitHead(n, flags, false);
};

cls.emitPow =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.jz('ex').w('(').eN(n.left, EC_NONE, false).w(',').os().eN(n.right, EC_NONE, false).w(')');
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


