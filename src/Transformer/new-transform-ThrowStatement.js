  import {Transformers} from '../other/globals.js';

Transformers['ThrowStatement'] =
function(n, isVal) {
  n.argument = this.tr(n.argument, true);
  return n;
};

