  import {Transformers} from '../other/globals.js';

Transformers['BreakStatement'] =
function(n, isVal) {
  return n; // TODO: try { break } finally { yield }
};

