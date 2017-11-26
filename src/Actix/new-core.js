  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.ii =
function(inactiveIf) {
  ASSERT.call(this, this.inactiveIf === null, 'inactiveIf' );
  this.inactiveIf = inactiveIf;
  return this;

};


