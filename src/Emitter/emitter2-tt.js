  import {ASSERT, ETK_NONE} from '../other/constants.js';
  import {cls} from './cls.js';

this.tt =
function(tt) {
  ASSERT.call(this, this.ttype === ETK_NONE, 'none');
  this.ttype = tt;
};

this.nott =
function() {
  ASSERT.call(this, this.ttype !== ETK_NONE, 'none');
  this.ttype = ETK_NONE;
};

this.nott_ifAny =
function() {
  if (this.ttype === ETK_NONE)
    return false;
  this.nott();
  return true;
};

