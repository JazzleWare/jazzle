this.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.nextLineHasLineBreakBefore = true;

  if (this.lineBlank()) this.startFreshLine();
  else this.finishCurrentLine();
};

this.overflowLength =
this.ol =
function(len) {
  var wl = this.wrapLimit;
  return wl <= 0 ? 0 : this.emcol_cur + len - wl;
};
