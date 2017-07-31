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


