  import {Transformers} from '../other/globals.js';

Transformers['NewExpression'] =
function(n, isVal) {
  n.callee = this.tr(n.callee, true);
  this.trList(n.arguments, true);
  return n;
};

