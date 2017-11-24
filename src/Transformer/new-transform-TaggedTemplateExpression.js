  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['TaggedTemplateExpression'] =
function(n, isVal) {
  n.tag = this.tr(n.tag, true);
  n.quasi = this.tr(n.quasi, true);

  return n;
};

