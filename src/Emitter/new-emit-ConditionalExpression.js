  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {EC_EXPR_HEAD, EC_NONE} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['ConditionalExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  this.emitCondTest(n.test, flags);
  this.wm('','?','').eN(n.consequent, EC_NONE, false);
  this.wm('',':','').eN(n.alternate, EC_NONE, false);
  hasParen && this.w(')');
  this.emc(cb, 'aft');
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

