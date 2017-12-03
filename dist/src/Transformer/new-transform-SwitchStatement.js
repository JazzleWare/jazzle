  import {Transformers} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';

Transformers['SwitchStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n. discriminant = this.tr(n.discriminant, true);
  var s = this.setScope(n['#scope']);
  this.trList(n.cases, false);
  this.setScope(s);
  return n;
};

Transformers['SwitchCase'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  if (n.test !== null)
    n.test = this.tr(n.test, true);
  var rr = this.setRR({v: true});
  this.trList(n.consequent, false);
  rr = this.setRR(rr);
  rr .v = false;
  return n;
};

