  import {ASSERT, HAS} from '../other/constants.js';
  import {cls} from './cls.js';

this.addVarTarget_m =
function(mname, newDecl) {
  ASSERT.call(this, !HAS.call(this.varTargets, mname),
    'var target is not unique: <'+mname+'>');
  this.varTargets[mname] = newDecl;
};

this.findVarTarget_m =
function(mname) {
  return this.varTargets[mname];
};

