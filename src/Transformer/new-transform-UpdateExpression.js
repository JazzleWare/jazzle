  import {Transformers} from '../other/globals.js';
  import {isResolvedName, tg} from '../other/util.js';
  import {CVTZ_C} from '../other/constants.js';
  import {cls} from './cls.js';

Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  if (isResolvedName(arg)) {
    tg(arg).ref.assigned();
    var leftsig = false;
    if (this.needsCVLHS(tg(arg))) {
      arg['#cvtz'] |= CVTZ_C;
      this.cacheCVLHS(tg(arg));
    }
    if (tg(arg).isRG())
      n = this.synth_GlobalUpdate(n, true);
  }

  return n;
};

