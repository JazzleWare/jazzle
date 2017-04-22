this.enterForInit =
function() { this.flags |= SF_FORINIT; };

this.exitForinit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};
