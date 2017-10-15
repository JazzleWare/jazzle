this.ensureNoSpace =
function() { ASSERT.call(this, !this.hasPendingSpace(), 'hasPendingSpace' ); };

this.hasPendingSpace =
function() { return this.pendingSpace !== SP_NONE; };

this.enqueueOmittableSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  this.pendingSpace = SP_OMITTABLE;
};

this.enqueueBreakingSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  this.pendingSpace = SP_BREAKABLE;
};

this.removePendingSpace =
function() {
  var sp = this.pendingSpace;
  this.pendingSpace = SP_NONE;
  return sp;
};

this.effectPendingSpace =
function(len) {
  ASSERT.call(this, this.notJustAfterLineBreak(), 'leading');
  var pendingSpace = this.removePendingSpace();
  switch (pendingSpace) {
  case SP_OMITTABLE:
    if (this.allow.space && this.ol(len+1) <= 0)
      this.writeToCurrentLine_space();
    break;
  case SP_BREAKABLE:
    if (this.ol(len+1) <= 0)
      this.writeToCurrentLine_space();
    else
      this.wrapCurrentLine();
    break;
  default:
    ASSERT.call(this, false, 'invalid type for pending space' );
    break;
  }
};

this.removePendingSpace_try =
function() {
  return this.hasPendingSpace() ? 
    this.removePendingSpace() : SP_NONE;
};

this.notJustAfterLineBreak =
function() {
  return this.curLine.length || !this.curLineHasLineBreakBefore;
};
