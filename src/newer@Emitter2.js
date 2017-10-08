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

this.wrapCurrentLine =
function() {
  this.hasPendingSpace() && this.removePendingSpace();
  this.writeToCurrentLine_virtualLineBreak();
  if (this.lineBlank())
    this.needsLeading = true;
  else
    this.finishCurrentLine();
  this.useOut(true);
  this.writeToOutput_lineBreak();
  this.useOut(false);
  this.hasLeading = true;
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

this.writeToOut_lineBreak =
function() {
  this.ensureOutActive();
  this.emline_cur++;
  this.sm += ';';
  this.writeToOut_raw('\n');
}; 

this.ensureNoSpace =
function() { ASSERT.call(this, !this.hasPendingSpace(), 'hasPendingSpace' ); };

this.hasPendingSpace =
function() { return this.pendingSpace !== SP_NONE; };

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
this.ol =
function(len) {
  return this.wrapLimit > 0 ?
    len - this.wrapLimit : 0;
};

this.removePendingSpace =
function() {
  var sp = this.pendingSpace;
  this.pendingSpace = SP_NONE;
  return sp;
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

this.removePendingSpace_try =
function() {
  return this.hasPendingSpace() ? 
    this.removePendingSpace() : SP_NONE;
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
  optimalIndentStrLength = optimalIndentLevel * this.indentString.length;

  if (optimalIndentStrLength >= 0) {
    var overflow = this.ol(optimalIndentStrLength);
    if (overflow > 0) {
      optimalIndentStrLength -= overflow;
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
};

this.writeToOut_raw =
function(str) { this.out += str; };

this.lineOverflow =
function(len) {
  var wl = this.wrapLimit;
  return wl < 0 ? 0 : this.emcol_cur + len - wl;
};

this.findIndentStringWithIdealLength =
function(idealLength) {
  var INLEN = this.indentString.length;
  ASSERT.call(this, idealLength % INLEN === 0, 'len'); // TODO: eliminate
  var level = idealLength / INLEN;

  var cache = this.indentCache, l = cache.length;
  if (level < l)
    return cache[level];

  var str = cache[l-1];
  ASSERT.call(this, l > 0, 'l');
  while (l <= level) {
    cache[l] = str = str + this.indentString;
    l++;
  }

  return str;
};

this.insertGuard =
function(guard) {
  ASSERT.call(this, this.guard === null, 'existing guard');
  ASSERT.call(this, this.guardArg === null, 'existing guardArg');
  ASSERT.call(this, this.guardListener === null, 'existing guardListener');

  this.guard = guard;
};

this.monitorGuard =
function(listener) {
  ASSERT.call(this, this.guard !== null, 'no');
  ASSERT.call(this, this.guardListener === null, 'listener');

  this.guardListener = listener;
};

this.runGuard =
function(str, t) {
  var guard = this.guard, guardListener = this.guardListener;
  this.removeGuard_any();

  this.runningGuard = true;
  guard.call(this, str, t);
  if (guardListener) {
    ASSERT_EQ.call(this, guardListener.v, false);
    guardListener.v = true;
  }
  this.runningGuard = false;
};

this.listenForEmits =
function(fallbackListener) {
  var l = null;
  if (this.guard === null) {
    l = fallbackListener;
    this.insertGuard(guard_simpleListener);
    this.monitorGuard(l);
  } else {
    l = this.guardListener;
    if (l === null) {
      l = this.defaultGuardListener;
      l.v = false;
      this.monitorGuard(l);
    }
  }
  return l;
};

this.removeGuard_any =
function() {
  ASSERT.call(this, this.guard !== null, 'no');
  this.guard = this.guardListener = null;
};

this.removeGuard_if =
function(listener) {
  ASSERT.call(this, this.guard !== null, 'no');
  var guardListener = this.guardListener;
  ASSERT.call(this, this.guardListener !== null, 'listener');

  if (listener !== guardListener)
    return false;

  ASSERT_EQ.call(this, listener.v, false);
  this.removeGuard_any();

  return true;
};

this.setGuardArg =
function(arg) {
  ASSERT.call(this, this.guard !== null, 'no');
  ASSERT.call(this, this.guardArg === null, 'n');

  this.guardArg = arg;
};

this.tt =
function(tt) {
  ASSERT.call(this, this.tt === ETK_NONE, 'none');
  this.tt = tt;
};

this.nott =
function() {
  ASSERT.call(this, this.tt !== ETK_NONE, 'none');
  this.tt = ETK_NONE;
};

this.nott_ifAny =
function() {
  if (this.tt === ETK_NONE)
    return false;
  this.nott();
  return true;
};
