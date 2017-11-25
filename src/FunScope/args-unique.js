  import {SF_UNIQUE} from '../other/scope-constants.js';
  import {ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

cls.insideUniqueArgs =
function() { return this.flags & SF_UNIQUE; };

cls.exitUniqueArgs =
function() {
  ASSERT.call(this, !this.inBody,
    'must be in args');
  ASSERT.call(this, this.insideUniqueArgs(),
    'must be in unique args');
  this.flags &= ~SF_UNIQUE;
};

cls.enterUniqueArgs =
function() {
  if (!this.canDup())
    return;

  this.verifyUniqueArgs();
  this.flags |= SF_UNIQUE;
};

cls.verifyUniqueArgs =
function() { this.firstDup && this.parser.err('argsdup'); };


