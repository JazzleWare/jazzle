  import {SF_STRICT} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.makeStrict =
function() {
  this.flags |= SF_STRICT; 
  if (this.isAnyFn())
    this.verifyForStrictness();
};


