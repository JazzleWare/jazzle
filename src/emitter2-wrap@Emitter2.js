this.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.writeToCurrentLine_virtualLineBreak();
  this.lineBlank() || this.finishCurrentLine();

  ASSERT_EQ.call(this, this.hasLeading, false);
  this.useOut(true);
  this.writeToOut_lineBreak();
  this.useOut(false);
  this.hasLeading = true;
};

this.overflowLength =
this.ol =
function(len) {
  var wl = this.wrapLimit;
  return wl <= 0 ? 0 : this.emcol_cur + len - wl;
};
