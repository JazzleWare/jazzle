this.regEsc_u =
function(ce) {
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

  return this.regChar_VECP(String.fromCharCode(v), c, ch, ce ? null : this.regLEIAC());
};

this.regEsc_uCurly =
function(ce) {
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
    return this.regChar_VECP(String.fromCharCode(ch), c, ch, ce ? null : this.regLEIAC());

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


