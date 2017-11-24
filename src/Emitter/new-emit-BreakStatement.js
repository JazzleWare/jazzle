  import {Emitters} from '../other/globals.js';
  import {ETK_ID} from '../other/constants.js';
  import {cls} from './cls.js';

Emitters['BreakStatement'] =
function(n, flags, isStmt) {
  this.wt('break',ETK_ID );
  var wl = this.wrapLimit;
  this.wrapLimit = 0;
  n.label && this.hs().writeToCurrentLine_raw(n.label.name);
  this.wrapLimit = wl;
  this.w(';');
};

