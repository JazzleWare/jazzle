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


