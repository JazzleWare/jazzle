this.clearPendingStrictErrors =
function() {
  if (this.ct === ERR_NONE_YET)
    return;

  ASSERT.call(this, this.ct === ERR_PIN_OCTAL_IN_STRICT,
    'the only strict error allowed currently is ERR_PIN_OCTAL_IN_STRICT');
  this.ct = ERR_NONE_YET;
};
