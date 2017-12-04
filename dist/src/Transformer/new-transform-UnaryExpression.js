  import {Transformers} from '../other/globals.js';

Transformers['UnaryExpression'] =
function(n, ownerList, isVal) {
  n.argument = this.tr(n.argument, ownerList, true);
  return n;
};

