  import {Emitters, UntransformedEmitters} from '../other/globals.js';
  import {cls} from './cls.js';

Emitters['#Untransformed'] = 
function(n, flags, isStmt) {
  return UntransformedEmitters[n.kind].call(this, n, flags, isStmt);
};

