  import {ATS_DISTINCT} from '../other/scope-constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './ctor.js';

cls.mustSynth =
function() {
  if (this.msynth !== -1)
    return this.msynth;

  var list = this.ref.rsList, e = 0, scope = null, msynth = 0;
  while (e < list.length) {
    scope = list[e++ ];
    if (scope.isAnyFn() && scope.scopeName) {
      var sn = scope.scopeName;
      if (sn.getAS() !== ATS_DISTINCT)
        sn = sn.source;
      if (this.name === sn.name && this !== sn) {
        msynth = 1;
        break;
      }
    }
  }

  if (msynth === 0) {
    var mname = _m(this.name);
    e = 0;
    while (e < list.length)
      list[e++].insertSynth_m(mname, this);
  }

  return this.msynth = msynth;
};


