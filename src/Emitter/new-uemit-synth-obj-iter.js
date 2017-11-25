  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT_EQ, EC_NONE} from '../other/constants.js';

UntransformedEmitters['obj-iter'] =
function(n, flags, isStmt) {
  this.eN(n.iter, flags, isStmt);
};

UntransformedEmitters['obj-iter-end'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.eN(n.iter, flags, isStmt);
};

UntransformedEmitters['obj-iter-get'] =
function(n, flags, isStmt) {
  this.eH(n.iter);
  if (n.computed)
    this.w('[').eA(n.idx, EC_NONE, false).w(']');
  else
    this.w('.').writeMemName(n.idx, false);
};

