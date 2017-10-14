this.flushCurrentLine =
function() {
  if (this.curLine.length) {
    this.finishCurrentLine(); 
    return true;
  }
  return false;
};

this.lineBlank =
function() { return this.curLine.length === 0; };

this.finishCurrentLine =
function() {
  var line = this.curLine;
  ASSERT.call(this, !this.finishingLine, 'finishing');
  ASSERT.call(this, line.length, 'line');

  this.ensureNoSpace();

  this.finishingLine = true;
  var optimalIndentLevel = this.allow.space ? this.curLineIndent : 0;
  var tailLineBreak = false, optimalIndentString = "", optimalIndentStrLength = 0;
  optimalIndentStrLength = optimalIndentLevel * this.indentString.length;

  if (optimalIndentStrLength >= 0) {
    var overflow = this.ol(optimalIndentStrLength);
    if (overflow > 0) {
      optimalIndentStrLength -= overflow;
      if (optimalIndentStrLength < 0)
        optimalIndentStrLength = 0;
    }
  }

  optimalIndentString = this.findIndentStringWithIdealLength(optimalIndentStrLength);

  if (this.nextLineHasLineBreakBefore)
    this.writeToCurrentLine_virtualLineBreak();

  this.useOut(true);

  if (this.curLineHasLineBreakBefore)
    this.writeToOut_lineBreak();

  this.writeToOut_raw(optimalIndentString);
  this.writeToOut_raw(this.curLine);

  this.adjustColumns(optimalIndentStrLength);
  this.refreshSMOutWithLM();

  this.useOut(false);

  this.startFreshLine();

  this.finishingLine = false;
};

this.adjustColumns =
function(lindLen) { // line indentation length
  if (this.hasRecorded_SMLinkpoint)
    this.ln_emcol_cur += lindLen;
  if (this.hasRecorded_emcol_latestRec)
    this.emcol_latestRec += lindLen;
  if (this.curLineHasLineBreakBefore)
    this.ln_emcol_latestRec = 0; // i.e., absolute
  else
    this.emcol_cur += lindLen;
};

this.startFreshLine =
function() {
  this.curLineHasLineBreakBefore = this.nextLineHasLineBreakBefore;
  this.curLineIndent = this.nextLineIndent;
  this.curLine = "";

  if (this.curLineHasLineBreakBefore)
    this.emcol_cur = 0;

  this.hasRecorded_SMLinkpoint = false;
  this.hasRecorded_emcol_latestRec = false;

  this.ln_emcol_latestRec = this.emcol_latestRec;
  this.lm = "";

  this.ln_vlq_tail = "";
  this.nextLineHasLineBreakBefore = this.allow.nl;
};

this.refreshSMOutWithLM =
function() {
  var lm0 = "", lm = this.lm;
  if (this.hasRecorded_SMLinkpoint) {
    var lm0 = vlq(this.ln_emcol_cur - this.ln_emcol_latestRec) + this.ln_vlq_tail;
    if (lm.length) lm0 += ',';
  }
  if (!this.curLineHasLineBreakBefore) {
    if (lm.length || lm0.length)
      this.smLen && this.writeToSMout(',');
  }
  lm0.length && this.writeToSMout(lm0);
  lm.length && this.writeToSMout(lm);
};
