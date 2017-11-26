  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['Identifier'] =
function(n, isVal) {
  n = this.toResolvedName(n, 'ex');
  return n;
};

cls.trSAT_name =
function(n, isVal) {
  n = this.toResolvedName(n, 'sat');
  return n;
};


