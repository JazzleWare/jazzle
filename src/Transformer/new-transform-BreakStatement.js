  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['BreakStatement'] =
function(n, isVal) {
  return n; // TODO: try { break } finally { yield }
};

