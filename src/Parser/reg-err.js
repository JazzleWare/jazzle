
this.regErr_nonexistentRef =
function(ref) {
  return this.regErrNew('nonexistent-ref', this.loc(), { ref: ref });
};

this.regErr_looseLCurly =
function() {
  return this.regErrNew('loose-lcurly', this.loc());
};

this.regErr_looseRCurly =
function() {
  return this.regErrNew('loose-rcurly', this.loc());
};

this.regErr_invalidUEsc =
function(esc) {
  return this.regErrNew('invalid-uesc', this.loc(), { esc: esc });
};

this.regErr_classUnfinished =
function() {
  return this.regErrNew('class-unfinished', this.loc());
};

this.regErr_looseCurlyQuantifier =
function(elem) {
  return this.regErrNew('loose-cq', elem.loc.start);
};

this.regErr_trailSlash =
function() {
  return this.regErrNew('trail-slash', this.loc());
};

this.regErr_hexEOF =
function() {
  return this.regErrNew('hex-eof', this.loc());
};

this.regErr_hexEscNotHex =
function() {
  return this.regErrNew('hex-not', this.loc());
};

this.regErr_minBiggerThanMax =
function(min, max) {
  return this.regErrNew('min-bigger-than-max', this.loc(), { min: min, max: max });
};

this.regErr_controlAZaz =
function(esc) {
  return this.regErrNew('control-AZaz', this.loc(), { esc: esc });
};

this.regErr_controlEOF =
function() {
  return this.regErrNew('control-eof', this.loc());
};

this.regErr_insufficientNumsAfterU =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('insufficient-nums-after-u', this.loc());
};

this.regErr_nonNumInU =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('non-num-in-u', this.loc());
};

this.regErr_looseQuantifier =
function() {
  return this.regErrNew('loose-quantifier', this.loc());
};

this.regErr_uRCurlyNotReached =
function(ce) {
  if (ce && this.testSRerr()) return null;
  return this.regErrNew('u-rcurly', this.loc());
};

this.regErr_1114111U =
function(ch, ce) {
  if (ce && this.testRSerr()) return null;
  return this.regErrNew('1114111-u', this.loc(), { value: ch });
};

this.regErr_curlyMinIsBiggerThanMax =
function(min, max) {
  return this.regErrNew('curly-min-is-bigger-max', this.loc(), { min: min, max: max });
};

this.regErr_unfinishedParen =
function(n) {
  return this.regErrNew('rparen-missing', this.loc(), { element: n });
};

this.regErr_invalidCharAfterQuestionParen =
function(ch) {
  return this.regErrNew('qparen', this.loc(), { ch: ch });
};

this.regErrNew =
function() {
  var kind = arguments[0];
  var eloc = (arguments.length > 1 && arguments[1]) || this.loc();
  var ctx = (arguments.length > 2 && arguments[2]) || null;

  ASSERT.call(this, this.regErr === null, 'regErr');
  this.regErr = {
    type: '#Regex.Err',
    kind: kind,
    context: ctx,
    position: this.c,
    loc: eloc
  };
  return null;
};

