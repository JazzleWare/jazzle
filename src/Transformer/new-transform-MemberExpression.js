  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['MemberExpression'] =
function(n, isVal) {
  n.object = this.tr(n.object, true);
  if (n.computed) n.property = this.tr(n.property, true);
  return n;
};

cls.trSAT_mem = Transformers['MemberExpression'];


