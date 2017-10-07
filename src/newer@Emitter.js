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
    var tt = this.curtt;
    tt === ETK_NONE || this.clearTT();
    this.callGuard(rawStr, tt);
    if (this.hasPendingSpace())
      this.effectPendingSpace(rawStr.length);
  } 

  ASSERT.call(this, this.guard === null, 'guard' );
  ASSERT.call(this, !this.hasPendingSpace(), 'pending space' );

  var curEmCol = this.emcol_cur;
  if (curEmCol && this.ol(rawStr.length) > 0)
    this.wrapLine();

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
  ASSERT.call(this, !this.hasPendingSpace(), 's');
  return this.writeToCurrentLine_checked(' ');
};

this.writeToOutput_lineBreak =
function(must) {
  if (!this.allow.nl && !must)
    return;
  this.curtt === ETK_NONE || this.rtt();
  this.sm += ';';
  this.emline_cur++;
  this.hasPendingSpace() && this.removePendingSpace();
  if (this.guard) {
    this.callGuard('\n', ETK_NL);
    
