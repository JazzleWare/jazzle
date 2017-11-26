  import {ASSERT, ETK_NONE} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.tt =
function(tt) {
  ASSERT.call(this, this.ttype === ETK_NONE, 'none');
  this.ttype = tt;
};

cls.nott =
function() {
  ASSERT.call(this, this.ttype !== ETK_NONE, 'none');
  this.ttype = ETK_NONE;
};

cls.nott_ifAny =
function() {
  if (this.ttype === ETK_NONE)
    return false;
  this.nott();
  return true;
};


