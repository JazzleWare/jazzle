  import {Transformers} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';

Transformers['SpreadElement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, true);
  this.accessJZ(); // jz.arr, jz.sp
  n.argument = this.tr(n.argument, isVal);
  return n;
};

