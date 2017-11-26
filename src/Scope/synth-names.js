  import {ASSERT} from '../other/constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './ctor.js';

cls.synth_defs_to =
function(targetScope) {
  var list = this.defs, e = 0, len = list.length(), insertSelf = this.isCatch() && !this.argIsSimple;
  while (e < len) {
    var tdclr = list.at(e++);
    if (this.owns(tdclr) && !tdclr.isFnArg() &&
      !(tdclr.isCatchArg() && this.argIsSimple)) {
      if ( tdclr.isImported())
        ASSERT.call(this, this.isSourceLevel(), 'not' );
      else {
        targetScope.synthDecl(tdclr);
        insertSelf && this.insertSynth_m(_m(tdclr.synthName), tdclr);
      }
    }
  }
};


