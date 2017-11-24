  import {SF_FORINIT, SF_INSIDEPROLOGUE} from '../other/scope-constants.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

this.enterForInit =
function() { this.flags |= SF_FORINIT; };

this.enterPrologue =
function() { this.flags |= SF_INSIDEPROLOGUE; };

this.exitForInit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};

this.exitPrologue =
function() {
  this.flags &= ~SF_INSIDEPROLOGUE;
};

