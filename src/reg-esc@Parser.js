this.regEsc =
function(ce) {
  var c = this.c, s = this.src, l = s.length;
  if (c+1 >= l)
    return null;
  var w = s.charCodeAt(c+1);
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
    return this.regEsc_hex(ce);
  case CH_c:
    return this.regEsc_control(ce);
  case CH_u:
    return this.regEsc_u(ce);
  case CH_D: case CH_W: case CH_S:
  case CH_d: case CH_w: case CH_s:
    return this.regClassifier();
  default:
    return (w >= CH_0 && w <= CH_7) ? this.regEsc_num(ce) : this.regEsc_itself(ce);
  }
};

this.regClassifier =
function() {
  var c0 = this.c, loc0 = this.loc(), t = this.src.charAt(c0+1);
  this.setsimpoff(c0+2);
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
  var s = this.src, l = s.length, c = this.c;
  c += 2; // \x
  if (c>=l)
    return this.regErr_hexEOF();

  var ch1 = hex2num(s.charCodeAt(c));
  if (ch1 === -1) {
    this.setsimpoff(c);
    return this.regErr_hexEscNotHex();
  }
  c++;
  if (c>=l)
    return this.regErr_hexEOF();
  var ch2 = hex2num(s.charCodeAt(c));
  if (ch2 === -1) {
    this.setsimpoff(c);
    return this.regErr_hexEOF();
  }

  c++;
  var ch = (ch1<<4)|ch2;
  // Last Elem If A CharSeq
  return this.regChar_VECP(String.fromCharCode(ch), c, ch, ce ? null : this.regLEIAC());
};

this.regEsc_simple =
function(v, ce) {
  return this.regChar_VECP(v, this.c+2, v.charCodeAt(0), ce ? null : this.regLEIAC());
};

this.regEsc_control =
function(ce) {
  var c0 = this.c, c = c0;
  var s = this.src, l = s.length;
  c += 2; // \c
  if (c>=l) {
    this.setsimpoff(c);
    return this.regErr_controlEOF();
  }
  var ch = s.charCodeAt(c);
  if ((ch > CH_Z || ch < CH_A) && (ch < CH_a || ch > CH_z)) {
    this.setsimpoff(c);
    return this.regErr_controlAZaz();
  }

  c++;
  ch &= 31;

  return this.regChar_VECP(String.fromCharCode(ch), c, ch, ce ? null : this.regLEIAC());
};
