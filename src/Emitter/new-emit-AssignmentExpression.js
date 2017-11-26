  import {EC_EXPR_HEAD, EC_NONE, ASSERT, EC_IN} from '../other/constants.js';
  import {isResolvedName, tg} from '../other/util.js';
  import {Emitters} from '../other/globals.js';
  import {wcb_afterVar} from '../other/wcb.js';
  import {cls} from './cls.js';

cls.emitAssignment_ex =
function(n, flags, isStmt) {
  var hasParen = flags & EC_EXPR_HEAD;
  var left = n.left;
  var target = null, cb = n['#c'];

  if (hasParen) { this.w('('); flags = EC_NONE; }

  this.emc(cb, 'bef');
  this.emitSAT(left, flags, 0);
  this.os();

  if (n.operator === '**=') {
    ASSERT.call(this, isResolvedName(n.left), 'not rn');
    this.w('=').os().jz('ex')
        .w('(').eN(n.left, EC_NONE, false)
        .w(',').os().eN(n.right, flags & EC_IN, false)
        .w(')');
  }
  else {
    if (n.operator === '+=') this.sl(n['#o']);
    this.w(n.operator).os();
    this.eN(n.right, flags & EC_IN, false);
  }

  this.emc(cb, 'aft');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

Emitters['AssignmentExpression'] =
function(n, flags, isStmt) {
  return this.emitAssignment_ex(n, flags, isStmt);
};

Emitters['#SynthAssig'] =
function(n, flags, isStmt) {
  if (n.binding && !tg(n.left).isVar())
    return this.emitAssignment_binding(n, flags, isStmt);
  return this.emitAssignment_ex(n, flags, isStmt);
};

cls.emitAssignment_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n.left), 'name');

  var cb = n['#c']; this.emc(cb, 'bef');
  tg(n.left).isLLINOSA() || this.w('var').gu(wcb_afterVar).os();
  this.emitRName_binding(n.left);
  tg(n.left).isLLINOSA() && this.wm('.','v');
  this.os().w('=').os();
  this.eN(n.right, EC_NONE, false);
  this.w(';');
  this.emc('aft');
  
  var l = n.left;
  tg(l).hasTZCheck && this.os().emitTZCheckPoint(tg(l));
};


