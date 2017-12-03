  import {Transformers} from '../other/globals.js';
  import {ASSERT_EQ} from '../other/constants.js';

Transformers['IfStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var altax = n['#elseScope'], conax = n['#ifScope'];

  n.test = this.tr(n.test, true);

  var s = this.setScope(conax);
  n.consequent = this.tr(n.consequent, false);

  if (n.alternate) {
    this.setScope(altax);
    n.alternate = this.tr(n.alternate, false);
  }

  this.setScope(s);

  return n;
};

