  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['NewExpression'] =
function(n, isVal) {
  n.callee = this.tr(n.callee, true);
  this.trList(n.arguments, true);
  return n;
};

