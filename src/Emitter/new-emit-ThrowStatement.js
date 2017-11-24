  import {Emitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {ETK_ID, EC_NONE} from '../other/constants.js';
  import {wcb_afterRet} from '../other/wcb.js';
  import {cls} from './cls.js';

Emitters['ThrowStatement'] =
function(n, flags, isStmt) {
  var r = {hasParen: false}, cb = CB(n);
  this.emc(cb, 'bef');

  this.sl(n.loc.start);
  this.wt('throw',ETK_ID).gu(wcb_afterRet).gar(r);
  this.eA(n.argument, EC_NONE, false);
  if (r.hasParen) this.w(')');
  this.w(';').emc(cb, 'aft');
};

