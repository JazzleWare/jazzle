this.regEsc =
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

this. parseRegex_regEscape_simple =
function(v, isBare) {
  var c0 = this.c;
  return this.parseRegex_regChar_attachOrMakeVLCPR(
    v, 1, v.charCodeAt(0), isBare ? this.regLEIAC() : null, c0, c0 + 2);
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


