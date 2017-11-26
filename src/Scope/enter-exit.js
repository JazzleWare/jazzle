  import {SF_FORINIT, SF_INSIDEPROLOGUE} from '../other/scope-constants.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.enterForInit =
function() { this.flags |= SF_FORINIT; };

cls.enterPrologue =
function() { this.flags |= SF_INSIDEPROLOGUE; };

cls.exitForInit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};

cls.exitPrologue =
function() {
  this.flags &= ~SF_INSIDEPROLOGUE;
};


