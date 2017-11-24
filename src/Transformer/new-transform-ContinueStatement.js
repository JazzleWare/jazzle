  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['ContinueStatement'] =
function(n, isVal) {
  return n;
};

