this.enterForInit =
function() { this.flags |= SF_FORINIT; };

this.enterPrologue =
function() { this.flags |= SF_INSIDEPROLOGUE; };

this.exitForinit =
function() {
  ASSERT.call(this, this.insideForInit(),
    'must be in a for');
  this.flags &= ~SF_FORINIT;
};

this.exitPrologue =
function() {
  this.flags &= ~SF_INSIDEPROLOGUE;
};
