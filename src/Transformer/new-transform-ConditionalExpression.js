  import {Transformers} from '../other/globals.js';
  import {createObj} from '../other/util.js';
  import {cls} from './cls.js';

// TODO: when transforming is done and the original cvtz is re-activated, it should be augment by the
// elements common between if.cvtz and else.cvtz; e.g., 12 ? l /* <-- tz */ : l() /* <-- tz */; /* cvtz += if.cvtz :@: else.cvtz let l = l /* has tz but no chk */
Transformers['ConditionalExpression'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var th = this.thisState;
  n.consequent = this.tr(n.consequent, isVal);
  var thc = this.thisState; this.thisState = th;
  this.setCVTZ(createObj(cvtz));
  n.alternate = this.tr(n.alternate, isVal);
  this.thisState = th|(this.thisState & thc); // same should be done for the tz/cv-thing, below
  this.setCVTZ(cvtz) ;
  return n;
};

