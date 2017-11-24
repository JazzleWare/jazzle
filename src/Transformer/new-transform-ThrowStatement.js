  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['ThrowStatement'] =
function(n, isVal) {
  n.argument = this.tr(n.argument, true);
  return n;
};

