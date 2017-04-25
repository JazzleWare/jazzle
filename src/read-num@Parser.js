this.readNum_raw = function(ch) {
  if (ch === CH_0)
    this.readNum_0();
  else {
    var c = this.c+1, s = this.src, l = s.length;
    while (c < l) {
      ch = s.charCodeAt(c);
      if (isNum(ch))
        c++;
      else
        break;
    }
    this.setsimpoff(c);
    if (ch === CH_SINGLEDOT)
      this.readNum_floatTail(FL_SIMPLE_NON0);
    else if (ch === CH_E || ch === CH_e)
      this.readNum_floatTail(FL_ONLY_E);
    else {
      this.ltraw = this.c0_to_c();
      this.ltval = parseInt(this.ltraw);
    }
  }

  this.lttype = TK_NUM;
};

this.readNum_0 =
function() {
  var ch = this.scat(this.c+1);
  switch (ch) {
  case CH_X: case CH_x:
    this.readNum_0x();
    break;

  case CH_B: case CH_b:
    this.readNum_0b();
    break;

  case CH_O: case CH_o:
    this.readNum_0o();
    break;

  case CH_SINGLEDOT:
    this.readNum_floatTail(FL_SIMPLE_0);
    break;

  case CH_E: case CH_e:
    this.readNum_floatTail(FL_ONLY_E);
    break;

  default:
    if (isNum(ch))
      this.readNum_octLegacy(ch);
    else {
      this.ltval = 0;
      this.ltraw = '0';
    }
  }
};

this.readNum_0b =
function() {
  var c = this.c+2, // '0b'
      s = this.src,
      l = s.length,
      v = 0;

  if (c >= l) {
    this.setsimpoff(c);
    this.err('bin.expected.got.eof');
  }

  var ch = s.charCodeAt(c);
  if (ch !== CH_0 && ch !== CH_1) {
    this.setsimpoff(c);
    this.err('bin.expected.got.something.else');
  }

  v = ch - CH_0;
  c++;
  while (c<l) {
    ch = s.charCodeAt(c);
    if (!isNum(ch))
      break;
    if (ch === CH_0 || ch === CH_1)
      v = (v << 1)|(CH_0);
    else
      this.err('bin.but.got.nonbin');
    c++;
  }

  this.setsimpoff(c);
  this.ltval = v;
  this.ltraw = this.c0_to_c();
};

this.readNum_octLegacy =
function(ch) {
  var c = this.c+2, s = this.src, l = s.length, dec = false;
  do {
    if (!dec && ch >= CH_8)
      dec = true;
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  if (dec && ch === CH_SINGLEDOT)
    this.readNum_floatTail(FL_LEGACY);
  else if (dec && (ch === CH_E || ch === CH_e))
    this.readNum_floatTail(FL_ONLY_E);
  else {
    this.ltraw = this.c0_to_c();
    this.ltval = parseInt(dec ? this.ltraw : this.ltraw.substring(1));
  }
};

this.readNum_floatTail =
function(headtype) {
  var c = this.c,
      s = this.src,
      l = s.length,
      digitsNeeded = headtype === FL_NONE,
      hasSign = false,
      ch = -1;

  c++; // '.'
  if (digitsNeeded) {
    if (c >= l || !isNum(s.charCodeAt(c)))
      this.err('float.tail.is.headless.must.have.digits');
    c++;
  }
  while (c<l && isNum(s.charCodeAt(c)))
    c++;

  MANTISSA:
  if (c<l) {
    ch = s.charCodeAt(c);
    if (ch !== CH_E && ch !== CH_e)
      break MANTISSA;

    c++;
    if (c >= l)
      this.err('float.nothing.after.e');
    ch = s.charCodeAt(c);
    if (ch === CH_MIN || ch === CH_ADD) {
      c++;
      if (c >= l)
        this.err('float.nothing.after.sign');
      ch = s.charCodeAt(c);
      hasSign = true;
    }
    if (!isNum(ch))
      this.err('float.needs.a.mantissa');
    c++;
    while (c<l && isNum(s.charCodeAt(c)))
      c++;
  }

  this.setsimpoff(c);

  this.ltraw = this.c0_to_c();
  this.ltval = parseFloat(
    headtype === FL_LEGACY ?
      this.ltraw.substring(1) :
      this.ltraw);
};
