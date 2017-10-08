this.tt =
function(tt) {
  ASSERT.call(this, this.tt === ETK_NONE, 'none');
  this.tt = tt;
};

this.nott =
function() {
  ASSERT.call(this, this.tt !== ETK_NONE, 'none');
  this.tt = ETK_NONE;
};

this.nott_ifAny =
function() {
  if (this.tt === ETK_NONE)
    return false;
  this.nott();
  return true;
};
