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
  if (this.allow.space)
    this.setPendingSpace(EST_OMITTABLE);
  return this;
};

// write -- raw
this.rwr =
function(rawStr) { this.curLine += rawStr; };

this.write =
function(rawStr) {
  this.hasPendingSpace() && this.effectPendingSpace(rawStr.length);
  if (this.wcb) {
    var tt = this.curtt;
    tt === ETK_NONE || this.rtt();
    this.call_onw(rawStr, tt);
  }
  this.hasPendingSpace() && this.effectPendingSpace(rawStr.length);

  ASSERT.call(this, arguments.length === 1, 'write must have only one single argument');

  // after a call to .indent (but not to .unindent), no further calls to .write are ever allowed until a .startNewLine call.
  ASSERT.call(this, this.curLineIndent < 0 || this.curLineIndent >= this.indentLevel, 'in' );

  var cll = this.curLine.length;
  cll && this.ol(cll+rawStr.length) > 0 && this.l();

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
  while (e < arguments.length) {
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
function(mustNL) {
  this.flush(mustNL);
};

this.l =
function() {
  this.startNewLine();
  return this;
};

this.wrap =
function() { return this.l(); };

this.flush =
function(mustNL) {
  ASSERT.call(this, this.pendingSpace === EST_NONE, 'pending space');
  var line = this.curLine;
  var len = line.length;
  if (len === 0)
    return;

  var optimalIndent = this.allow.space ? this.curLineIndent : 0;
  if (optimalIndent >= 0 && this.wrapLimit > 0 && optimalIndent + len > this.wrapLimit) {
    optimalIndent = len < this.wrapLimit ? this.wrapLimit - len : 0;
    mustNL = true;
  }
  this.out.length && this.insertLineBreak(mustNL);
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
  if (e < 0)
    return "";
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

this.wt =
function(rawStr, tk) {
  this.t(tk);
  this.write(rawStr);
  this.curtt = ETK_NONE;
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
  len += this.curLine.length;
  var s = this.pendingSpace;
  this.pendingSpace = EST_NONE;
  switch (s) {
  case EST_OMITTABLE:
    this.ol(len+1) <= 0 && this.insertSpace();
    break;
  case EST_BREAKABLE:
    if (this.ol(len+1) <= 0) this.insertSpace();
    else { this.startNewLine(); this.onw(wcb_wrap); }
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
  ASSERT.call(this, !this.hasPendingSpace(), 'pending space');
  ASSERT.call(this, this.wcb === null, 'wcb');
  this.wcbp = wcbp;
  this.wcb = wcb;
  return this;
};

this.call_onw =
function(rawStr, tt) {
  var w = this.wcb;
  if (this.wcbUsed) {
    ASSERT_EQ.call(this, this.wcbUsed.v, false);
    this.wcbUsed.v = true;
  }
  this.clear_onw();
  w.call(this, rawStr, tt);
};

this.insertSpace =
function() {
  this.wcb && this.call_onw(' ', ETK_NONE);
  this.curLine += ' '; 
};

this.clear_onw =
function() {
  ASSERT.call(this, this.wcb, 'wcb null');
  this.wcb = null;
  if (this.wcbUsed) this.wcbUsed = null;
  return this;
};

this.jz =
function(name) {
  return this.wt('jz', ETK_ID).wm('.',name);
};

this.insertLineBreak =
function(mustNL) {
  if (!this.allow.nl && !mustNL) return;
  this.curtt === ETK_NONE || this.rtt();
  this.wcb && this.call_onw('\n', ETK_NL);
  this.out += '\n';
};
