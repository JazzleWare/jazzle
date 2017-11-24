  import {Emitters} from '../other/globals.js';
  import {ETK_ID} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['ContinueStatement'] =
function(n, flags, isStmt) {
  this.wt('continue',ETK_ID );
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeIDName(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};

