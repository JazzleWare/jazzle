this.bs =
function() {
  this.setPendingSpace(EST_BREAKABLE);
  return this;
};

this.hs =
function() {
  this.insertSpace();
  return this;
};

this.os =
function() {
  this.setPendingSpace(EST_OMITTABLE);
  return this;
};

// write -- raw
this.rwr =
function(rawStr) { this.out += rawStr; };

this.write =
function(rawStr) {
  ASSERT.call(this, arguments.length === 1, 'write must have only one single argument');
//ASSERT.call(this, this.curLineIndent === this.indentLevel, 'in' );
  this.wcb && this.call_onw(rawStr);
  this.hasPendingSpace() && this.effectPendingSpace(rawStr.length);
  this.rwr(rawStr);
};

this.w =
function(rawStr) {
  this.write(rawStr);
  return this;
};

this.wm =
function() {
  ASSERT.call(this, arguments.length > 1, 'writeMul must have more than one single argument');
  var e = 0;
  while (e < argumnts.length) {
    var rawStr = arguments[e++ ];
    switch (rawStr) {
    case ' ': this.bs(); break;
    case '': this.os(); break;
    default: this.write(rawStr); break;
    }
  }
  return this;
};

this.startNewLine =
function() {
  this.flush();
};

this.l =
function() {
  this.startNewLine();
  return this;
};

this.wrap =
function() { return this.l(); };

this.flush =
function() {
  ASSERT.call(this, this.pendingSpace === EST_NONE, 'pending space');
  var line = this.curLine;
  var len = line.length;
  ASSERT.call(this, len, 'len');
  var optimalIndent = this.curLineIndent;
  if (this.wrapLimit > 0 && optimalIndent + len > this.wrapLimit)
    optimalIndent = len < this.wrapLimit ? this.wrapLimit - len : 0;
  this.out.length && this.insertLineBreak();
  this.out += this.geti(optimalIndent) + line;

  this.curLine = "";
  this.curLineIndent = this.indentLevel;
};

this.indent =
function() { this.indentLevel++; };

this.i =
function() { this.indent(); return this; };

this.unindent =
function() {
  ASSERT.call(this, this.indentLevel > 0, '0');
  this.indentLevel--;
};

this.u =
function() {
  this.unindent();
  return this;
};

this.geti =
function(e) {
  var inc = this.indentCache;
  while (e < inc.length)
    return inc[e];
  if (inc.length === 0)
    inc[0] = "";
  while (e >= inc.length)
    inc[inc.length] = inc[inc.length-1] + this.indentString;
  return inc[e];
};

this.t =
function(tk) {
  ASSERT.call(this, this.curtt === ETK_NONE, 't' );
  this.curtt = tk;
  return this;
};

this.rtt =
function() {
  ASSERT.call(this, this.curtt !== ETK_NONE, 'none');
  this.curtt = TK_NONE;
};

this.hastt =
function(tmask) { return this.curtt & tmask; };

this.ol =
function(e) { // overflow line-length
  return this.wrapLimit && (e - this.wrapLimit);
};

this.hasPendingSpace =
function() { return this.pendingSpace !== EST_NONE; };

this.effectPendingSpace =
function(len) {
  ASSERT.call(this, this.curLine.length, 'leading');
  var s = this.pendingSpace;
  this.pendingSpace = EST_NONE;
  switch (s) {
  case EST_OMITTABLE:
    this.ol(len+1) <= 0 && this.insertSpace();
    break;
  case EST_BREAKABLE:
    this.ol(len+1) <= 0 ? this.insertSpace() : this.startNewLine();
    break;
  default:
    ASSERT.call(this, false, 'invalid type for pending space');
    break;
  }
};

this.setPendingSpace =
function(est) {
  ASSERT.call(this, this.pendingSpace === EST_NONE, 'pending space is not none');
  this.pendingSpace = est;
};

this.onw =
function(wcb, wcbp) {
  ASSERT.call(this, this.wcb === null, 'wcb');
  this.wcbp = wcbp;
  this.wcb = wcb;
  return this;
};

this.call_onw =
function(rawStr) {
  var w = this.wcb;
  this.clear_onw();
  w.call(this, rawStr);
};

this.clear_onw =
function() {
  ASSERT.call(this, this.wcb, 'wcb null');
  this.wcb = null;
  return this;
};

this.insertSpace =
function() { this.curLine += ' '; };

this.insertLineBreak =
function() { this.out += '\n'; };

this. p =
function() {
  ASSERT.call(this, this.curtt === ETK_NONE, 't' );
  this.w('(').rtt();
  return this;
};
