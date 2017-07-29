// GENERAL RULE: if error occurs while parsing an elem, the parse routine sets the `regexErr and returns null
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

this. parseRegex_regBranch =
function() {
  this.errorRegexElem = null;
  this.regQuantifiable = false;
  var elem = this.parseRegex_regElem();
  if (elem === null)
    return null;
  var elements = [];
  do {
    if (elem !== this.lastRegexElem) {
      if (this.regQuantifiable) {
        this.regQuantifiable = false;
        if (this.regPBQ || this.regPCQ || (!rec(elem) && this.parseRegex_tryPrepareQuantifier()))
          elem = this.regQuantified(elem);
      }
      elements.push(elem);
      this.lastRegexElem = elem; // reuse CharSeq
    }
    this.regQuantifiable = false;
    elem = this.parseRegex_regElem();
    if (this.errorRegexElem)
      return null;
  } while (elem);

  var lastElem = elements[elements.length-1 ];
  return {
    type: '#Regex.Branch',
    elements: elements,
    start: elements[0].start,
    end: lastElem.end,
    loc: { start: elements[0].loc.start, end: lastElem.loc.end }
  };
};

this. parseRegex_regPattern =
function() {
  var c0 = this.c, li0 = this.li, col0 = this.col;
  var l = this.resetLastRegexElem();
  var branches = null, elem = this.parseRegex_regBranch();
  if (this.errorRegexElem)
    return null;
  branches = [];
  if (this.expectChar(CH_OR)) {
    branches.push(elem)
    do {
      elem = this.parseRegex_regBranch();
      if (this.errorRegexElem)
        return null;
      branches.push(elem);
      this.resetLastRegexElem();
    } while (this.expectChar(CH_OR));
  }
  else if (elem)
    branches.push(elem);
  
  var startLoc = branches.length ? branches[0].loc.start : { line: li0, column: col0 };
  var lastElem = branches.length ? branches[branches.length-1] : null;
  var endLoc = lastElem ? lastElem.end.loc : this.loc();

  this.lastRegexElem = l;

  return {
    type: '#Regex.Main',
    branches: branches,
    start: c0,
    end: lastElem ? lastElem.end : this.c, // equal either way, actually
    loc: { start: startLoc, end: endLoc }
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
  case CH_OR:
  case CH_RPAREN:
    return null;
  default:
    return this.parseRegex_regChar(true);
  }
};

this. parseRegex_regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = s.length;
  if (c0+1 >= l)
    return this.setErrorRegex(this.parseRegex_errParen());
  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.parseRegex_regPeekOrGroup();
  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.parseRegex_regPattern();
  if (this.errorRegexElem)
    return this.regexErrorElem;

  this.regQuantifiable = true;
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
    return this.setErrorRegex(n);
  }
};

this. parseRegex =
function(rc, rli, rcol, rsrc) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var src0 = this.src;

  this.src = rsrc;

  this.c = rc;
  this.li = rli;
  this.col = rcol;

  var n = this.parseRegex_regPattern();

  this.c = c;
  this.li = li;
  this.col = col;

  // must never actually happen or else an error-regex-elem would have existed for it
  if (n.branches.length <= 0)
    this.err('regex.with.no.elements');
  if (this.errorRegexElem)
    return this.resetErrorRegex();

  return n;
};

this. parseRegex_regCurly =
function() {
  if (!this.regCurlyChar) {
    var c = this.c, li = this.li, col = this.col;
    var n = this.parseRegex_regCurlyQuantifier(true);
    if (n)
      return this.setErrorRegex(this.regErr_curlyQuantifier(n));
  }
  this.regCurlyChar = false;
  return this.parseRegex_regChar(true);
};

this. parseRegex_regClass =
function() {
  var c0 = this.c, loc0 = this.loc(), list = [];
  var e = null, latest = null;
  var n = null;

  var inverse = false;
  if (this.scat(c0+1) === CH_XOR)
    inverse = true;

  this.setsimpoff(inverse ? c0 + 2 : c0 + 1);
  var untouchedAtoms = 0;

  while (e = this.parseRegex_regClassElem()) {
    if (untouchedAtoms >= 2 && recDash(latest) && list.length >= 2) { //         regular expression class dash
      var complete = this.parseRegex_tryMakeRange(list, e);
      if (!complete)
        return null;
      latest = null;
      untouchedAtoms = 0;
    }
    else {
      list.push(e);
      latest = e;
      untouchedAtoms < 2 && untouchedAtoms++;
    }
  }

  n = {
    type: '#Regex.Class',
    elements: list,
    start: c0,
    end: this.c,
    inverse: inverse,
    loc: { start: loc0, end: this.loc() }
  };
  if (!this.expectChar(CH_RSQBRACKET))
    return this.setErrorRegex(this.parseRegex_errBracketUnfinished(n));

  this.regQuantifiable = true;
  return n;
};

this. parseRegex_regClassElem =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return null;
  switch (s.charCodeAt(c)) {
  case CH_BACK_SLASH:
    return this.parseRegex_regClassEscape();
  case CH_RSQBRACKET:
    return null;
  default: return this.parseRegex_regClassChar();
  }
};

this. parseRegex_regClassEscape =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c+1 >= l)
    return null;
  var w = l.charCodeAt(c+1 );
  switch (w) {
  case CH_v:
    return this.parseRegex_regClassEscape_simple('\v');
  case CH_b:
    return this.parseRegex_regClassEscape_simple('\b');
  case CH_f:
    return this.parseRegex_regClassEscape_simple('\f');
  case CH_t:
    return this.parseRegex_regClassEscape_simple('\t');
  case CH_r:
    return this.parseRegex_regClassEscape_simple('\r');
  case CH_n:
    return this.parseRegex_regClassEscape_simple('\n');
  case CH_x:
    return this.parseRegex_regClassEscape_hex();
  case CH_c:
    return this.parseRegex_regClassEscape_control();
  case CH_u:
    return this.parseRegex_regClassEscape_u();
  default:
    if (w >= CH_0 && w <= CH_7)
      return this.parseRegex_regClassEscape_num();
    return this.parseRegex_regClassEscape_itself();
  }
};

this. parseRegex_regClassChar =
function() {
  return this.parseRegex_regChar(false);
};

this. parseRegex_regChar =
function(isBare) {
  var c0 = this.c, s = this.src;
  return this.parseRegex_regChar_attachOrMakeVLCPR(
    s.charAt(c0), 1, s.charCodeAt(c0),
    isBare ? this.regLEIAC() : null, c0, c0 + 1);
};

this. parseRegex_regClassEscape_simple =
function(v) {
  var c0 = this.c;
  return this.parseRegex_regChar_attachOrMakeVLCPR(
    v, 1, v.charCodeAt(0), null, c0, c0 + 2);
};

this. parseRegex_regClassEscape_hex =
function() {
  return this.parseRegex_regChar_hex(false);
};

this. parseRegex_regChar_hex =
function(isBare) { // thas is, not in []s
  var s = this.src, l = s.length, c = this.c;
  c += 2; // \x
  if (c>=l)
    return this.regerr_hexEOF();

  var c0 = this.c;
  var ch1 = hex2num(s.charCodeAt(c));
  if (ch1 === -1) {
    this.setsimpoff(c);
    return this.regerr_hexEscNotHex();
  }
  c++;
  if (c>=l)
    return this.regerr_hexEOF();
  var ch2 = hex2num(s.charCodeAt(c));
  if (ch2 === -1) {
    this.setsimpoff(c);
    return this.regerr_hexEOF();
  }

  c++;

  var v = (ch1<<4)|ch2;
  // Last Elem If A CharSeq
  return this.parseRegex_regChar_attachOrMakeVLCPR(
    String.fromCharCode(v), 1, v, isBare ? this.regLEIAC() : null, c0, c
  );
};

this. parseRegex_regChar_attachOrMakeVLCPR =
function(val, len, ch, parent, rs, re) {
  var s = this.src, raw = s.substring(rs, re);
  var loc0 = this.loc();
  this.setsimpoff(re);
  var li = this.li, col = this.col;
  if (this.parseRegex_tryPrepareQuantifier())
    parent = null;

  if (parent) {
    parent.raw += raw;
    parent.charLength += len;
    parent.value += val;
    parent.end += raw.length;
    parent.loc.end += raw.length;
    if (parent.cp !== -1)
      parent.cp = -1;
    return parent;
  }

  this.regQuantifiable = true;
  return {
    type: '#Regex.CharSeq',
    raw: s.substring(rs,re),
    start: rs,
    end: re,
    cp: ch,
    charLength: len,
    loc: { start: loc0, end: { line: li, column: col } },
    value: val,
  };
};

this.resetLastRegexElem =
function() {
  var lastRegexElem = this.lastRegexElem;
  if (lastRegexElem !== null)
    this.lastRegexElem = null;
  return lastRegexElem;
};

this.regLEIAC =
function() {
  return (this.lastRegexElem && rec(this.lastRegexElem)) ?
    this.lastRegexElem : null;
};

this.expectChar =
function(ch) {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return false;
  if (s.charCodeAt(c) === ch) {
    this.setsimpoff(c+1);
    return true;
  }
  return false;
};

this. parseRegex_tryPrepareQuantifier =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return false;
  switch (s.charCodeAt(c)) {
  case CH_ADD:
  case CH_QUESTION:
  case CH_MUL:
    this.regPCQ = true; // peek charQuantifier
    return true;
  case CH_LCURLY:
    this.regPBQ = this.parseRegex_regCurlyQuantifier();
    return this.regPBQ !== null;
  }
  return false;
};

this. parseRegex_regCurlyQuantifier =
function() {
  var c0 = this.c, c = c0, s = this.src, l = s.length, li0 = this.li, col0 = this.col;
  c++; // '{'
  this.setsimpoff(c);
  VALID: {
    var minVal = this.parseRegex_tryParseNum();
    if (minVal === -1)
      break VALID;
    var minRaw = s.substring(c, this.c);
    c = this.c;
    if (c >= l)
      break VALID;
    var maxVal = -1, maxRaw = "";
    if (s.charCodeAt(c) === CH_COMMA) {
      c++; // ','
      this.setsimpoff(c);
      maxVal = this.parseRegex_tryParseNum();
      if (maxVal !== -1) {
        maxRaw = s.substring(c,this.c);
        c = this.c;
      }
      else
        maxRaw = 'inf';
    }
    if (c >= l)
      break VALID;
    if (s.charCodeAt(c) !== CH_RCURLY)
      break VALID;
    this.setsimpoff(c+1);
    return {
      type: '#Regex.CurlyQuantifier',
      min: { raw: minRaw, value: minVal },
      max: { raw: maxRaw, value: maxVal },
      end: this.c,
      start: c0,
      loc: { start: { line: li0, column: col0 }, end: this.loc() }
    };
  }

  this.c = c0;
  this.li = li0;
  this.col = col0;
  this.regCurlyChar = true;
  return null;
};

this.regQuantified =
function(elem) {
  var c = this.c, li = this.li, col = this.col;
  var loc = null, s = this.src;
  var t = '', bq = null;

  if (this.regPCQ) {
    ASSERT.call(this, this.regPBQ === null, 'hasPBQnt');
    this.regPCQ = false;
    t = s.charAt(c);
    c++;
    this.setsimpoff(c);
    loc = this.loc();
  } 
  else if (this.regPBQ) {
    ASSERT.call(this, !this.regPCQ, 'hasPCQnt');
    t = '{}';
    bq = this.regPBQ;
    this.regPBQ = null;
    loc = bq.loc.end;
  }
  else 
    ASSERT.call(this, false, 'neither PCQnt nor PBQnt');

  var greedy = true;
  if (this.scat(this.c) === CH_QUESTION) {
    if (bq)
      loc = { start: loc.start, end: loc.end };
    c++;
    this.setsimpoff(c);
    loc.end++;
    greedy = false;
  }

  return {
    type: '#Regex.Quantified' ,
    rangeQuantifier: bq,
    quantifier: t,
    pattern: elem,
    start: elem.start,
    loc: { start: elem.loc.start, end: loc },
    end: this.c,
    greedy: greedy
  };
};

this. parseRegex_tryParseNum =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return -1;
  var v = 0, ch = s.charCodeAt(c);
  if (!isNum(ch))
    return -1;
  var mul = 1;

  do {
    v += (ch - CH_0) * mul;
    mul *= 10;
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  return v;
};
