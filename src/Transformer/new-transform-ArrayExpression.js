  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['ArrayExpression'] =
function(n, isVal) {
  this.trList(n.elements, true );
  return n;
};

