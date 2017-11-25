  import {Transformers} from '../other/globals.js';

// Transformers['ForOfStatement'] = function(n, isVal) { return n; };
// Transformers['ForInStatement'] = function(n, isVal) { return n; };
Transformers['ForStatement'] = function(n, isVal) { return n; };

