  import {Transformers} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';

Transformers['ExpressionStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n.expression = this.tr(n.expression, false);
  return n;
};

