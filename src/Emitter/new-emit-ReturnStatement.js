  import {Emitters} from '../other/globals.js';
  import {ASSERT_EQ, ETK_ID, EC_NONE} from '../other/constants.js';
  import {CB} from '../other/util.js';
  import {wcb_afterRet} from '../other/wcb.js';

Emitters['ReturnStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);

  var cb = CB(n);
  this.emc(cb, 'bef');

  this.sl(n.loc.start); // TODO: only ctors without supers

  this.wt('return',ETK_ID);
  if (n.argument) {
    var l = {hasParen: false};
    this.gu(wcb_afterRet).gar(l);
    this.emitAny(n.argument, EC_NONE, false);
    if (l.hasParen) this.w(')');
  } else
    this.emc(cb, 'ret.aft');
  this.w(';');
  this.emc(cb, 'aft');
};

