  import {UntransformedEmitters} from '../other/globals.js';
  import {cls} from './cls.js';

UntransformedEmitters['skip'] =
function(n, flags, isStmt) { return false; };

