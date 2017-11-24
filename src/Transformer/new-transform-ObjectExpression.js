  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['ObjectExpression'] =
function(n, isVal) {
  var t = null;
  if (n['#rest'] >= 0)
    t = n['#t'] = this.allocTemp();
  var list = n.properties, e = 0;
  while (e < list.length) {
    var elem = list[e++];
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    elem.value = this.tr(elem.value, true);
  }
  t && this.releaseTemp(t);
  return n;
};

