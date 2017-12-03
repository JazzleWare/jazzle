  import {Transformers} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';

Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var bs = n['#scope'];
  if (bs.isCatch())
    bs = null;
  if (bs !== null) {
    var s = this.setScope(bs);
    this.cur.synth_defs_to(this.cur.synthBase);
  }
  this.trList(n.body, isVal);
  if (bs !== null) this.setScope(s);
  return n;
};

