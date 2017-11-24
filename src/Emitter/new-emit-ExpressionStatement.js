  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {ASSERT_EQ, ASSERT, EC_START_STMT} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['ExpressionStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  ASSERT.call(this, flags & EC_START_STMT, 'must be in stmt context');
  this.emitAny(n.expression, flags, true );
  this.emc(cb, 'aft');
  return true;
};

