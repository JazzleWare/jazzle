// errors pertaining to u escapes first will check for pending semi ranges at the start of their corresponding routines
this.regEsc_u =
function(ce) {
  if (ce && this.regSemiRange &&
    this.regSemiRange.max.escape !== 'hex4' && !this.regTryCompleteSemiRange())
    return null;

  var c = this.c, s = this.src, l = s.length;
  c += 2; // \u
  if (c >= l)
    return this.regErr_insuffucientNumsAfterU();

  var r = s.charCodeAt(c);
  if (r === CH_LCURLY)
    return this.regEsc_uCurly(ce);

  var ch = 0, n = 0;
  while (true) {
    r = hex2num(r);
    if (r === -1) {
      this.setsimpoff(c);
      return this.regErr_insufficientNumsAfterU();
    }
    ch = (ch<<4)|r;
    c++; n++;

    // fail early if there is a pending semi-range and this is not a surrogate trail
    if (ce) {
      if ((n === 1 && r !== 0x0d) ||
        (n === 2 && r < 0x0c))
        if (this.testSRerr())
          return null;
    }
    if (n >= 4)
      break;
    if (c >= l)
      return this.regErr_insufficientNumsAfterU();
    r = s.charCodeAt(c);
  }

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c, 'lead', 'hex4');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c, 'trail', 'hex4');

  return this.regChar_VECI(String.fromCharCode(v), c, ch, ce);
};

this.regEsc_uCurly =
function(ce) {
  if (ce && this.testSRerr())
    return null;

  var c = this.c, s = this.src, l = s.length;
  c += 3; // \u{
  if (c >= l)
    return this.regErr_insufficientNumsAfterU();
  var r = s.charCodeAt(c);
  var ch = hex2num(r);
  if (ch === -1) {
    this.setsimpoff(c);
    return this.regErr_nonNumInU();
  }
  c++;
  while (true) {
    if (c >= l)
      return this.regErr_uBraceNotReached();

    r = s.charCodeAt(c);
    if (r === CH_RCURLY) { c++; break; }

    r = hex2num(r);
    if (r === -1) {
      this.setsimpoff(c);
      return this.regErr_nonNumInU();
    }

    ch = (ch<<4)|r;
    if (ch > 1114111) {
      this.setsimpoff(c);
      return this.regErr_1114111U();
    }
    c++;
  }

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c, 'lead', '{}');

  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c, 'trail', '{}');

  if (ch <= 0xffff)
    return this.regChar_VECI(String.fromCharCode(ch), c, ch, ce);

  var c0 = this.c, loc0 = this.loc();
  this.setsimpoff(c);
  if (!ce)
    this.regIsQuantifiable = true;
  return {
    type: '#Regex.Ho', // Higher-order, i.e., > 0xFFFF
    cp: ch,
    start: c0,
    end: c,
    raw: s.substring(c0, c),
    loc: { start: loc0, end: this.loc() },
    c1: null, c2: null
  };
};


