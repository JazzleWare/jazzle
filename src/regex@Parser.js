this. parseRegex_regUnitAssertion =
function() {
  var c0 = this.c, loc0 = this.loc();
  var kind = this.src.charAt(this.c);
  this.setsimpoff(this.c+1);
  return {
    type: '#Regex.Assertion',
    kind: kind,
    start: c0,
    end: this.c,
    pattern: null,
    loc: { start: loc0, end: this.loc() }
  };
};

this. parseRegex_regPattern =
function() {
  this.errorRegexElem = null;
  var elements = [], elem = null;
  while (elem = this.parseRegex_regElem()) {
    if (this.errorRegexElem)
      break;
    elements.push(elem);
    if (this.scat(this.c) === CH_OR)
      this.setsimpoff(this.c+1);
    else break;
  }
  if (this.errorRegexElem)
    return this.resetErrorRegex();

  var lastElem = elements[elements.length-1 ];
  return {
    type: '#Regex',
    elements: elements,
    start: elements[0].start,
    end: lastElem.end,
    loc: { start: elements[0].loc.start, end: lastElem.loc.end }
  };
};

this. parseRegex_regElem =
function() {
  if (this.pendingRegexElem)
    return this.resetRegexElem();
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;

  switch (s.charCodeAt(c)) {
  case CH_LSQBRACKET:
    return this.parseRegex_regClass();
  case CH_LPAREN:
    return this.parseRegex_regParen();
  case CH_LCURLY:
    return this.parseRegex_regCurly();
  case CH_BACK_SLASH:
    return this.parseRegex_regEscape();
  case CH_$:
  case CH_XOR:
    return this.parseRegex_regUnitAssertion();
  case CH_QUESTION:
  case CH_ADD:
  case CH_MUL:
    return this.setErrorRegex(this.parseRegex_errQuantifier());
  case CH_RPAREN:
    return null;
  default: return this.parseRegex_regString();
  }
};

this. parseRegex_regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = s.length;
  if (c0+ 1 >= l)
    return this.setErrorRegex(this.parseRegex_errParen());
  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.parseRegex_regPeekOrGroup();
  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.parseRegex_regPattern();
  var n = {
    type: '#Regex.Paren',
    capturing: true,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };

  if (!this.expectChar(CH_RPAREN))
    return this.parseRegex_errParenUnfinished(n);

  return n;
};

this. parseRegex_regPeekOrGroup =
function() {
  var c0 = this.c, s = this.src, l = s.length;
  switch (this.scat(c0+2)) {
  case CH_EQUALITY_SIGN:
    return this. parseRegex_regPeek(true);
  case CH_EXCLAMATION:
    return this. parseRegex_regPeek(false);
  case CH_COLON:
    return this. parseRegex_regGroup();
  default:
    var n = this. parseRegex_errPQ(); // (?
    return this.setErrRegex(n);
  }
};

this. parseRegex =
function(rc, rli, rcol, rsrc) {
  var c0 = this.c0, c = this.c;
  var li0 = this.li0, li = this.li;
  var col0 = this.col0, col = this.col;
  var src0 = this.src;

  this.src = rsrc;

  this.c0 = this.c = rc;
  this.li0 = this.li = rli;
  this.col0 = this.col = rcol;

  var n = this.parseRegex_regPattern();
  // must never actually happen or else an error-regex-elem would have existed for it
  if (n.elements.length <= 0)
    this.err('regex.with.no.elements');
  return n;
};


