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
      elem = this.regAdaptTo(elements, elem);
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

this.regAdaptTo =
function(list, elem) {
  if (list.length === 0) 
    return elem;
  var last = list[list.length-1];
  if (last.type === '#Regex.SurrogateComponent' && last.kind === 'lead' &&
    elem.type === '#Regex.SurrogateComponent' && elem.kind === 'trail') {
    last.next = elem;
    if (this.regexFlags.u && last.escape === elem.escape ) {
      list.pop();
      this.regQuantifiable = true;
      return this.regMakeSurrogate(last, elem);
    }
  }
  return elem;
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
    return this.parseRegex_regEscape(true);
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
function(rc, rli, rcol, rsrc, flags) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var src0 = this.src;

  this.src = rsrc;

  this.c = rc;
  this.li = rli;
  this.col = rcol;

  var e = 0, str = 'guymi';
  while (e < str.length) {
    this.regexFlags[str[e]] = flags.indexOf(str[e]) >= 0;
    e++;
  }

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

  ASSERT.call(this, this.regCurlyChar, 'reg{}');

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

  while (e = this.parseRegex_regClassElem()) {
    this.regPushClassElem(list, e);
    if (this.regexErrorElem)
      return null;
  }
  if (this.regexErrorElem)
    return null;
  if (list.length) {
    var last = list[list.length-1 ];
    if (last.type === '#Regex.SemiRange' && !this.regValidateSemi(last))
      return null;
  }
  if (!this.expectChar(CH_RSQBRACKET))
    return this.setErrorRegex(this.parseRegex_errBracketUnfinished(n));

  n = {
    type: '#Regex.Class',
    elements: list,
    start: c0,
    end: this.c,
    inverse: inverse,
    loc: { start: loc0, end: this.loc() }
  };

  this.regQuantifiable = true;
  return n;
};

this.regPushClassElem =
function(list, elem) {
  if (list.length === 0) {
    list.push(elem);
    return;
  }
  var num = list.length;
  var tail = list[num-1];
  if (tail.type === '#Regex.SemiRange') {
    if (this.parseRegex_tryAttachTrailSurrogateToSemi(tail, elem))
      return;
    if (this.errorRegexElem)
      return;
  }
  else if (tail.type === '#Regex.SurrogateComponent' &&
    tail.kind === 'lead' &&
    elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'trail') {
    if (this.regexFlags.u && tail.escape !== '{}' && elem.escape === tail.escape) {
      list.pop();
      list.push(this.regMakeSurrogate(tail, elem));
    }
    else
      list.push(elem);
    tail.next = elem;
    return;
  }
  if (tail.type !== '#Regex.Hy') {
    list.push(elem);
    return;
  }
  var maxv = cpReg(elem);
  if (maxv === -1) {
    list.push(elem);
    return;
  }
  if (num < 2) {
    list.push(elem);
    return;
  }
  var head = list[num-2 ];
  var minv = cpReg(head);
  if (minv === -1) {
    list.push(elem);
    return;
  }

  var semi = false;
  if (this.regexFlags.u && elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'lead' && elem.escape !== '{}')
    semi = true;
  else if (minv > maxv)
    return this.regerr_minBiggerThanMax(head, elem);

  list.pop(); // '-'
  list.pop(); // head

  var min = head, max = elem;

  list.push({
    type: semi ? '#Regex.SemiRange' : '#Regex.Range',
    min: min,
    start: min.start,
    end: max.end,
    max: max,
    loc: semi ? null : { start: min.loc.start, end: max.loc.end }
  });
};

this. parseRegex_tryAttachTrailSurrogateToSemi =
function(semi, elem) {
  var createdSurrogate = false;
  if (elem.type === '#Regex.SurrogateComponent' &&
    elem.kind === 'trail') {
    semi.max.next = elem;
    if (elem.escape === semi.max.escape) {
      semi.max = this.regMakeSurrogate(semi.max, elem);
      createdSurrogate = true;
    }
  }
  if (this.regValidateSemi(semi))
    return createdSurrogate;

  return false;
};

this.regMakeSurrogate =
function(c1, c2) {
  return {
    type: '#Regex.Ho',
    cp: surrogate(c1.cp, c2.cp ),
    start: c1.start,
    end: c2.end,
    raw: c1.raw + c2.raw,
    loc: { start: c1.loc.start, end: c2.loc.end },
    c1: c1,
    c2: c2
  };
};

this.regValidateSemi =
function(semi) {
  ASSERT.call(this, semi.type === '#Regex.SemiRange', 'semi' );
  ASSERT.call(this, semi.max.cp >= 0, 'max');
  ASSERT.call(this, semi.min.cp >= 0, 'min');
  if (semi.min.cp > semi.max.cp)
    return this.regerr_minBiggerThanMax(semi.min, semi.max );

  semi.type = '#Regex.Range';
  semi.loc = { start: semi.min.loc.start, end: semi.max.loc.end };
  return semi;
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
  return this.parseRegex_regEscape(false);
};

this. parseRegex_regEscape =
function(isBare) {
  var c = this.c, s = this.src, l = s.length;
  if (c+1 >= l)
    return null;
  var w = s.charCodeAt(c+1 );
  switch (w) {
  case CH_v:
    return this.parseRegex_regClassEscape_simple('\v');
  case CH_b:
    return isBare ?
      this.parseRegex_regBbAssertion() :
      this.parseRegex_regEscape_simple('\b', isBare);
  case CH_f:                                             
    return this.parseRegex_regEscape_simple('\f', isBare);
  case CH_t:                                             
    return this.parseRegex_regEscape_simple('\t', isBare);
  case CH_r:                                             
    return this.parseRegex_regEscape_simple('\r', isBare);
  case CH_n:                                             
    return this.parseRegex_regEscape_simple('\n', isBare);
  case CH_x:
    return this.parseRegex_regEscape_hex(isBare);
  case CH_c:
    return this.parseRegex_regEscape_control(isBare);
  case CH_u:
    return this.parseRegex_regEscape_u(isBare);
  case CH_D:
  case CH_W:
  case CH_S:
  case CH_d:
  case CH_w:
  case CH_s:
    return this.regClassifier();
  default:
    if (w >= CH_0 && w <= CH_7)
      return this.parseRegex_regEscape_num(isBare);
    return this.parseRegex_regEscape_itself(isBare);
  }
};

this. parseRegex_regClassChar =
function() {
  return this.parseRegex_regChar(false);
};

this.regClassifier =
function() {
  var c0 = this.c, loc0 = this.loc(), t = this.src.charAt(c0+1 );
  this.setsimpoff(c0+2);
  return {
    type: '#Regex.Classifier',
    start: c0,
    loc: { start: loc0, end: this.loc() },
    end: this.c,
    kind: t
  };
};

this. parseRegex_regChar =
function(isBare) {
  var c0 = this.c; 
  var s = this.src;
  var ch = s.charCodeAt(c0);

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponentVOKE(ch, c0 + 1, 'lead', 'none');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponentVOKE(ch, c0 + 1, 'trail', 'none');

  var l = this.parseRegex_regChar_attachOrMakeVLCPR(
    s.charAt(c0), 1, ch,
    isBare ? this.regLEIAC() : null, c0, c0 + 1);
  if (!isBare && ch === CH_MIN)
    l.type = '#Regex.Hy'; // '-'
  return l;
};

this. parseRegex_regEscape_simple =
function(v, isBare) {
  var c0 = this.c;
  return this.parseRegex_regChar_attachOrMakeVLCPR(
    v, 1, v.charCodeAt(0), isBare ? this.regLEIAC() : null, c0, c0 + 2);
};

this. parseRegex_regEscape_hex =
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
    v *= mul;
    v += (ch - CH_0);
    if (v) mul *= 10; // leading zeros not significant
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  return v;
};

this. parseRegex_regEscape_control =
function(isBare) {
  var c0 = this.c, c = c0;
  var s = this.src, l = s.length;
  c += 2; // \c
  if (c>=l) {
    this.setsimpoff(c);
    return this.regerr_controlEOF();
  }
  var ch = s.charCodeAt(c);
  if ((ch > CH_Z || ch < CH_A) && (ch < CH_a || ch > CH_z)) {
    this.setsimpoff(c);
    return this.regerr_controlAZaz();
  }
  c++;
  ch &= 31;
  return this. parseRegex_regChar_attachOrMakeVLCPR(String.fromCharCode(ch), 1, ch, isBare ? this.regLEIAC() : null, c0, c);
};

this. parseRegex_regEscape_u =
function(isBare) {
  var c = this.c, s = this.src, l = s.length;
  c += 2; // \u
  if (c >= l)
    return this.regerr_insuffucientNumsAfterU();
  var ch = s.charCodeAt(c);
  if (ch === CH_LCURLY)
    return this.parseRegex_regEscape_uCurly();
  var v = 0, n = 0;
  while (true) {
    ch = hex2num(ch);
    if (ch === -1) {
      this.setsimpoff(c);
      return this.regerr_insufficientNumsAfterU();
    }
    v = (v<<4)|ch;
    c++;
    n++;
    if (n >= 4)
      break;
    if (c >= l)
      return this.regerr_insufficientNumsAfterU();
    ch = s.charCodeAt(c);
  }

  if (v >= 0x0d800 && v <= 0x0dbff)
    return this.regSurrogateComponentVOKE(v, c, 'lead', 'hex4');
  if (v >= 0x0dc00 && v <= 0x0dfff)
    return this.regSurrogateComponentVOKE(v, c, 'trail', 'hex4');

  return this.parseRegex_regChar_attachOrMakeVLCPR(
    String.fromCharCode(v), 1, ch, isBare ? this.regLEIAC() : null, this.c, c);
};

this. parseRegex_regEscape_uCurly =
function(isBare) {
  var c = this.c, s = this.src, l = s.length;
  c += 3; // \u{
  if (c >= l)
    return this.regerr_insufficientNumsAfterU();
  var r = s.charCodeAt(c);
  var v = hex2num(r);
  if (v === -1) {
    this.setsimpoff(c);
    return this.regerr_nonNumInU();
  }
  c++;
  while (true) {
    if (c >= l)
      return this.regerr_uBraceNotReached();
    r = s.charCodeAt(c);
    if (r === CH_RCURLY) {
      c++;
      break;
    }
    r = hex2num(r);
    if (r === -1) {
      this.setsimpoff(c);
      return this.regerr_nonNumInU();
    }
    v = (v<<4)|r;
    if (v > 1114111) {
      this.setsimpoff(c);
      return this.regerr_1114111U();
    }
    c++;
  }

  if (v >= 0x0d800 && v <= 0x0dbff)
    return this.regSurrogateComponentVOKE(v, c, 'lead', '{}');

  if (v >= 0x0dc00 && v <= 0x0dfff)
    return this.regSurrogateComponentVOKE(v, c, 'trail', '{}');

  if (v <= 0xffff)
    return this.parseRegex_regChar_attachOrMakeVLCPR(
      String.fromCharCode(v), 1, v, isBare ? this.regLEIAC() : null, this.c, c);

  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(c);
  this.regQuantifiable = true;
  return {
    type: '#Regex.Ho', // Higher-order, i.e., > 0xFFFF
    cp: v,
    start: c0,
    end: c,
    raw: s.substring(c0, c),
    loc: { start: loc0, end: this.loc() },
    c1: null, c2: null
  };
};

this.regSurrogateComponentVOKE =
function(cp, offset, kind, escape) {
  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(offset);
  this.regQuantifiable = true;
  return {
    type: '#Regex.SurrogateComponent',
    kind: kind,
    start: c0,
    end: offset,
    cp: cp,
    loc: { start: loc0, end: this.loc() },
    next: null, // if it turns out to be the lead of a surrogate pair
    escape : escape ,
    raw: this.src.substring(c0, offset)
  };
};
