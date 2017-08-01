this.regCurlyQuantifier =
function() {
  ASSERT_EQ.call(this, this.regCurlyChar, false);
  var c0 = this.c, c = c0, s = this.src, l = s.length;
  c++; // '{'
  this.setsimpoff(c);
  VALID: {
    var minVal = this.regTryToParseNum();
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
      maxVal = this.regTryToParseNum();
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

  this.regCurlyChar = true;
  return null;
};
