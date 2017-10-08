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

  this.useOut(true);

  if (this.hasLeading)
    this.hasLeading = false;
  else switch (true) {
  case this.needsLeading:
    this.needsLeading = false;
  case this.allow.nl:
    this.writeToOut_lineBreak();
  }

  this.writeToOut_raw(optimalIndentString);
  this.writeToOut_raw(this.curLine);

  this.useOut(false);

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

  this.curLine = this.lm = "";
  this.curLineIndent = this.nextLineIndent;

  this.finishingLine = false;
};
