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

  if (this.hasRecordedSMLinkpoint) {
    var lm0 = vlq(this.ln_emcol_cur + optimalIndentStrLength) + this.ln_vlq_tail;
    this.ln_vlq_tail = "";
    var lm = this.lm;
    if (lm.length) lm0 += ',';
//  this.smOutActive = true;
    this.writeToSMout(lm0);
    this.writeToSMout(lm);
    this.hasRecordedSMLinkpoint = false;
    this.lm = "";
  }

  this.writeToOut_raw(optimalIndentString);
  this.writeToOut_raw(this.curLine);

  this.useOut(false);


  this.curLine = "";
  this.curLineIndent = this.nextLineIndent;

  this.finishingLine = false;
};
