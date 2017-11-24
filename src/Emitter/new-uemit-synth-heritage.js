  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT_EQ, EC_NONE} from '../other/constants.js';
  import {cls} from './cls.js';

UntransformedEmitters['heritage'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.jz('h').sl(n.heritage.loc.start);

  this.w('(').eN(n.heritage, EC_NONE, false).w(')');
};

