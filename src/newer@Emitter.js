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
  this.ensureNoSpace();

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
  this.ensureNoSpace();
  this.writeToCurrentLine_checked(' ');
};

this.writeToCurrentLine_virtualLineBreak =
function() {
  this.ensureNoSpace();
  this.guard && this.callGuard('\n', ETK_NL);
};

this.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.writeToCurrentLine_virtualLineBreak();
  this.finishCurrentLine();
  this.useOut(true);
  this.writeToOutput_lineBreak();
  this.useOut(false);
  this.leadingNL = true;
};

this.writeToOut_nonLineBreak =
function(str) {
  this.ensureOutActive();
  this.writeToOut_raw(str);
};

this.useOut =
function(use) {
  ASSERT_EQ.call(this, !this.outActive, use);
  this.outActive = use;
};

this.flush =
function() { this.curLine.length && this.finishCurrentLine(); };

this.writeToOut_lineBreak =
function() {
  this.ensureOutActive();
  this.emline_cur++;
  this.sm += ';';
  this.writeToOut_raw('\n');
}; 

this.ensureNoSpace =
function() { ASSERT.call(this, !this.hasPendingSpace(), 'hasPendingSpace' ); };

this.ensureOutActive =
function() { ASSERT.call(this, this.outActive, 'out is not in use' ); };

this.enqueueOmittableSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.curLine.length, 'leading');
  this.pendingSpace = SP_OMITTABLE;
};

this.enqueueBreakingSpace =
function() {
  this.ensureNoSpace(); ASSERT.call(this, this.curLine.length, 'leading');
  this.pendingSpace = SP_BREAKABLE;
};

this.overflowLength =
function(len) {
  return this.wrapLimit > 0 ?
    len - this.wrapLimit : 0;
};

this.effectPendingSpace =
function(len) {
  ASSERT.call(this, this.curLine.length, 'leading');
  var pendingSpace = this.removePendingSpace();
  switch (pendingSpace) {
  case SP_OMITTABLE:
    if (this.ol(len+1) <= 0)
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

this.indentNextLine =
function() { this.nextLineIndent++; };

this.unindentNextLine =
function() {
  ASSERT.call(this, this.nextLineIndent > 0, 'line has a <1 indent');
  this.nextLineIndent--;
};

this.finishCurrentLine =
function() {
  var line = this.curLine;
  ASSERT.call(this, line.length, 'line');

  this.ensureNoSpace();

  var optimalIndentLevel = this.allow.space ? this.curLineIndent : 0;
  var tailLineBreak = false, optimalIndentString = "", optimalIndentStrLength = 0;
  optimalIndentStringLength = optimalIndentLevel * this.indentString.length;

  if (optimalIndentStrLength >= 0) {
    var overflow = this.ol(optimalIndentStrLength);
    if (overflow >= 0) {
      optimalIndentStrLength -= overflow;
      tailLineBreak = true;
    }
  }

  optimalIndentString = this.findIndentStringWithIdealLength(optimalIndentStrLength);

  this.useOut(true);

  if (this.leadingNL)
    this.leadingNL = false;
  else if (this.allow.nl)
    this.writeToOut_lineBreak();

  this.writeToOut_raw(optimalIndentString);
  this.writeToOut_raw(this.curLine);

  if (this.ln) {
    var lm0 =
      vlq(this.ln_emcol_cur + optimalIndentString.length) +
      this.ln_srci_vlq + this.ln_loc_vlq + this.ln_namei_vlq;
    this.ln_srci_vlq = this.ln_namei_vlq = this.ln_loc_vlq = "";
    if (this.lm.length) lm0 = lm0 + ',';
    this.lm = lm0 + this.lm;
    this.ln = false;
  }
  this.sm += this.lm;

  if (tailLineBreak) {
    this.writeToOut_lineBreak();
    this.leadingNL = true;
  }

  this.curLine = this.lm = "";
  this.curLineIndent = this.nextLineIndent;
};
