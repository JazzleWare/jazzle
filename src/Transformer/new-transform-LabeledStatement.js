  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['LabeledStatement'] =
function(n, isVal) {
  n.body = this.tr(n.body, false );
  return n;
};

