  import {UntransformedEmitters} from '../other/globals.js';
  import {ETK_ID} from '../other/constants.js';

UntransformedEmitters['synth-name'] =
function(n, flags, isStmt) {
  this.wt(n.liq.synthName, ETK_ID );
  return true;
};

