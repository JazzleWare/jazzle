  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {ASSERT_EQ} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['EmptyStatement'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  ASSERT_EQ.call(this, isStmt, true);
  this.w(';');
  this.emc(cb, 'aft');
  return true;
};

