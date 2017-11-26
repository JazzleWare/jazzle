  import {ASSERT, ASSERT_EQ} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.activateBody =
function() {
  ASSERT.call(this, this.hasHead(),
    'a scope with a head was expected');

  ASSERT_EQ.call(this, this.inBody, false);
  this.inBody = true;
  this.refs = this.bodyRefs;
};

cls.deactivateBody =
function() {
  ASSERT.call(this, this.hasHead(),
    'a scope with a head was expected');

  ASSERT_EQ.call(this, this.inBody, true);
  this.inBody = false;
  this.refs = this.argRefs;
};


