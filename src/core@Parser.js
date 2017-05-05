this.clearPendingStrictErrors =
function() {
  if (this.ct === ERR_NONE_YET)
    return;

  ASSERT.call(this, this.ct === ERR_PIN_UNICODE_IN_RESV,
    'the only strict error allowed currently is ERR_PIN_UNICODE_IN_RESV');
  this.ct = ERR_NONE_YET;
};
