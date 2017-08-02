this.regEsc =
function(ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c+1 >= l)
    return this.regErr_trailSlash();

  var elem = null;
  var c0 = this.c, li0 = this.li, col0 = this.col, luo0 = this.luo;
  // fail early for pending SRs
  var w = s.charCodeAt(c+1);
  if (w !== CH_u) {
    if (ce && this.testSRerr())
      return null;
  }
  else {
    elem = this.regEsc_u(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regEsc_itself(CH_u, ce);
  }

  switch (w) {
  case CH_v:
    return this.regEsc_simple('\v', ce);
  case CH_b:
    return ce ? this.regEsc_simple('\b', ce) : this.regBbAssertion();
  case CH_f:
    return this.regEsc_simple('\f', ce);
  case CH_t:
    return this.regEsc_simple('\t', ce);
  case CH_r:
    return this.regEsc_simple('\r', ce);
  case CH_n:
    return this.regEsc_simple('\n', ce);
  case CH_x:
    elem = this.regEsc_hex(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regEsc_itself(ce);
  case CH_c:
    elem = this.regEsc_control(ce);
    if (elem || this.regErr) return elem;
    this.rw(c0,li0,col0,luo0);
    return this.regChar(ce); // ... but not c
  case CH_D: case CH_W: case CH_S:
  case CH_d: case CH_w: case CH_s:
    return this.regClassifier();
  case CH_B:
    return ce ? this.regEsc_itself(w, ce) : this.regBbAssertion();
  default:
    if (w >= CH_0 && w <= CH_9) {
      elem = this.regEsc_num(w, ce);
      if (elem || this.regErr) return elem;
      this.rw(c0,li0,col0,luo0);
    }
    return this.regEsc_itself(w, ce);
  }
};

this.regClassifier =
function() {
  var c0 = this.c, loc0 = this.loc(), t = this.src.charAt(c0+1);
  this.setsimpoff(c0+2);
  this.regIsQuantifiable = true;
  return {
    type: '#Regex.Classifier',
    start: c0,
    loc: { start: loc0, end: this.loc() },
    end: this.c,
    kind: t
  };
};

this.regEsc_hex =
function(ce) { 
  var s = this.src, l = this.regLastOffset, c = this.c;
  c += 2; // \x
  if (c>=l)
    return this.rf.u ? this.regErr_hexEOF() : null;

  var ch1 = hex2num(s.charCodeAt(c));
  if (ch1 === -1) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_hexEscNotHex() : null;
  }
  c++;
  if (c>=l)
    return this.rf.u ? this.regErr_hexEOF() : null;
  var ch2 = hex2num(s.charCodeAt(c));
  if (ch2 === -1) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_hexEOF() : null;
  }

  c++;
  var ch = (ch1<<4)|ch2;
  // Last Elem If A CharSeq
  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

this.regEsc_simple =
function(v, ce) {
  return this.regChar_VECI(v, this.c+2, v.charCodeAt(0), ce);
};

this.regEsc_control =
function(ce) {
  var c0 = this.c, c = c0;
  var s = this.src, l = this.regLastOffset;
  c += 2; // \c
  if (c>=l) {
    this.setsimpoff(c);
    return this.rf.u ? this.regErr_controlEOF() : null;
  }
  var ch = s.charCodeAt(c);

  INV:
  if ((ch > CH_Z || ch < CH_A) && (ch < CH_a || ch > CH_z)) {
    if (!this.rf.u && ce && ((ch >= CH_0 && ch <= CH_9) || ch === CH_UNDERLINE))
      break INV;
    this.setsimpoff(c); // TODO: unnecessary if there is no 'u' flag
    return this.rf.u ? this.regErr_controlAZaz() : null;
  }

  c++;
  ch &= 31;

  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

var isUIEsc = makeAcceptor('^$\\.*+?()[]{}|/');
this.regEsc_itself =
function(ch, ce) {
  var c = this.c, s = this.src;
  c++; // \
  if (this.rf.u) {
    if (!isUIEsc(ch) && (!ce || ch !== CH_MIN)) {
      this.setsimpoff(c);
      return this.regErr_invalidUEsc();
    }
  } else 
    ASSERT.call(this, ch !== CH_c, 'c' );

  c++;
  return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);
};

this.regEsc_num =
function(ch, ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (ch === CH_0)
    return this.regEsc_num0(ce);
  var r0 = ch;
  var num = ch - CH_0;
  c += 2; // \[:num:]
  while (c < l) {
    ch = s.charCodeAt(c);
    if (!isNum(ch)) break;
    num *= 10;
    num += ch - CH_0;
    c++;
  }
  if (num <= this.regNC) {
    var c0 = this.c, loc0 = this.loc();
    this.setsimpoff(c);
    return {
      type: '#Regex.Ref',
      value: num,
      start: c0,
      end: this.c,
      raw: s.substring(c0, this.c),
      loc: { start: loc0, end: this.loc() }
    };
  }
  if (this.rf.u) {
    this.setsimpoff(c);
    return this.regErr_nonexistentRef();
  }
  if (r0 >= CH_8)
    return null;
  return this.regEsc_legacyNum(r0, ce);
};

// TODO: strict-chk
this.regEsc_legacyNum =
function(ch, ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  var max = ch >= CH_4 ? 1 : 2, num = ch - CH_0;
  c += 2; // \[:num:]
  while (c < l) {
    ch = s.charCodeAt(c);
    if (ch < CH_0 || ch > CH_7) break;
    num = (num<<3)|(ch-CH_0);
    c++;
    if (--max === 0) break;
  }
  return this.regChar_VECI(String.fromCharCode(num), c, num, ce);
};

this.regEsc_num0 =
function(ce) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  c += 2; // \0
  if (c < l) {
    var r = s.charCodeAt(c);
    if (r >= CH_0 && r <= CH_7)
      return this.regEsc_legacyNum(CH_0, ce);
  }
  return this.regEsc_simple('\0', ce);
};
