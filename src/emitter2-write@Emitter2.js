this.writeToCurrentLine_checked =
function(rawStr) {
  ASSERT.call(this, arguments.length === 1, 'write must have only one single argument');

  ASSERT.call(this, typeof rawStr === STRING_TYPE, 'str' );
  ASSERT.call(this, rawStr.length, 'writing ""' );

  var srcLoc = this.locw;
  if (srcLoc) { this.locw = null; }

  if (this.hasPendingSpace())
    this.effectPendingSpace(rawStr.length);

  if (this.guard) {
    var tt = this.tt;
    tt === ETK_NONE || this.nott();
    this.runGuard(rawStr, tt);
    if (this.hasPendingSpace())
      this.effectPendingSpace(rawStr.length);
  }
  else 
    this.tt === ETK_NONE || this.nott();

  ASSERT.call(this, this.guard === null, 'guard' );
  this.ensureNoSpace();

  var curEmCol = this.emcol_cur;
  if (curEmCol && this.ol(rawStr.length) > 0)
    this.wrapCurrentLine();

  srcLoc && this.refreshTheSourceMapWith(srcLoc);

  this.writeToCurrentLine_raw(rawStr);
};

this.writeToCurrentLine_raw =
function(rawStr) {
  this.emcol_cur += rawStr.length;
  this.curLine += rawStr;
};

this.writeToCurrentLine_space =
function() {
  this.ensureNoSpace();
  this.writeToCurrentLine_checked(' ');
};

this.writeToCurrentLine_virtualLineBreak =
function() {
  this.ensureNoSpace();
  this.guard && this.runGuard('\n', ETK_NL);
};
