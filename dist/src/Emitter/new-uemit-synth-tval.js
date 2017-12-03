  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT, EC_NONE} from '../other/constants.js';

UntransformedEmitters['tval'] =
function(n, flags, isStmt) {
  var ex = n.ex;
  ASSERT.call(this, ex.type === '#Untransformed' && ex.kind === 'temp', 't');
  this.eN(ex, EC_NONE, false).wm('.','val');
};

