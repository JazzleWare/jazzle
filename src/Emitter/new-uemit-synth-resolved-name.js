  import {Emitters} from '../other/globals.js';
  import {tg, cvc, tzc, CB, isResolvedName} from '../other/util.js';
  import {EC_CALL_HEAD, ASSERT_EQ, EC_EXPR_HEAD, EC_NON_SEQ, EC_NONE, ETK_ID, ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['#-ResolvedName.ex'] = cls.emitRName_ex =
Emitters['#-ResolvedName.sat'] = cls.emitRName_SAT =
function(n, flags, isStmt) {
  var hasParen = false;
  var hasZero = false;
  var tv = tg(n).isLLINOSA(); // tail v
  var tz = false;

  if (tv)
    hasZero = hasParen = flags & EC_CALL_HEAD;
  if (n.type === '#-ResolvedName.ex') {
    ASSERT_EQ.call(this, cvc(n), false);
    tz = tzc(n);
    if (tz) {
      if (!hasParen) hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
      if (hasZero) hasZero = false;
    }
  }
  if (tg(n).isGlobal())
    this.sl(n.loc.start);
  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (hasZero) this.wm('0',',')
  else if ( tz) {
    this.emitAccessChk_tz(tg(n), n.loc.start);
    this.w(',').os();
  }

  var cb = CB(n); this.emc(cb, 'bef');

//var ni = this.smSetName(n.id.name);
  this.wt(tg(n).synthName, ETK_ID );
  tv && this.wm('.','v');
//this.sl(n.id.loc.end);
//this.namei_cur = ni;

  this.emc(cb, 'aft');
  hasParen && this.w(')');
//tz && this.sl(n.id.loc.end);
  isStmt && this.w(';');
  return true;
};

Emitters['#-ResolvedName.binding'] = cls.emitRName_binding =
function(n, flags, isStmt) {
  ASSERT.call(this, isResolvedName(n), 'rn');
  var cb = CB(n); this.emc(cb, 'bef' );
  this.wt(tg(n).synthName, ETK_ID );
  this.emc(cb, 'aft');
  return true;
};

