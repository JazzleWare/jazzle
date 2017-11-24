  import {UntransformedEmitters} from '../other/globals.js';
  import {cls} from './cls.js';

UntransformedEmitters['u'] =
function(n, flags, isStmt) {
  this.jz('u').w('(').eN(n.value).w(')');
  return true;
};

