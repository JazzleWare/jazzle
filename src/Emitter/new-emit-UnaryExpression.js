  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {EC_EXPR_HEAD, EC_NONE, ETK_MIN, ETK_ADD, ETK_ID, ASSERT} from '../other/constants.js';
  import {wcb_MIN_u, wcb_ADD_u, wcb_afterVDT} from '../other/wcb.js';
  import {cls} from './cls.js';

Emitters['UnaryExpression'] = 
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var o = n.operator;
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }

  switch (o) {
  case '!':
  case '~':
    this.w(o);
    break;
  case '-':
    this.wt(o, ETK_MIN).gu(wcb_MIN_u);
    break;
  case '+':
    this.wt(o, ETK_ADD).gu(wcb_ADD_u);
    break;
  case 'void': case 'delete': case 'typeof':
    this.wt(o, ETK_ID).gu(wcb_afterVDT);
    break;
  default:
    ASSERT.call(this, false, 'unary [:'+o+':]');
    break;
  }

  this.emitUA(n.argument);
  hasParen && this.w(')');
  this.emc(cb, 'aft');

  isStmt && this.w(';');
  return true;
};

this.emitUA = function(n) {
  switch (n.type) {
  case 'UnaryExpression':
  case 'UpdateExpression':
    return this.emitAny(n, EC_NONE, false);
  }
  return this.emitHead(n, EC_NONE, false);
};

