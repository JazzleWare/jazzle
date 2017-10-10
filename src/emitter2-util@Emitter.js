this.writeStringValue =
function(sv, ql) {
  var ch = -1, len = sv.length, c = 0, v = "";
  while (c < len) {
    ch = sv.charCodeAt(c);
    v = this.isNormalCh(ch) ?
      sv.charCodeAt(c) :
      this.stringEscapeFor(ch);

    var vLen = v.length;
    if (vLen === c+ql)
      vLen += ql;

    if (this.ol(vLen) > 0) {
      this.writeToCurrentLine_raw('\\');
      this.finishCurrentLine();
      this.curLineIndent = 0;
    }

    this.writeToCurrentLine_raw(v);
    c++;
  }
};

this.isNormalCh =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH:
  case CH_SINGLE_QUOTE:
  case CH_MULTI_QUOTE:
    return false;
  }

  return ch <= CH_COMPLEMENT && ch >= CH_WHITESPACE;
};

this.stringEscapeFor =
function(ch) {
  switch (ch) {
  case CH_BACK_SLASH: return '\\\\';
  case CH_SINGLE_QUOTE: return '\\\'';
  case CH_MULTI_QUOTE: return '\\\"';
  case CH_VTAB: return '\\v';
  case CH_BACK: return '\\b';
  case CH_FORM_FEED: return '\\f';
  case CH_TAB: return '\\t';
  case CH_CARRIAGE_RETURN: return '\\r';
  case CH_LINE_FEED: return '\\n';
  default:
    if (ch<=0xFF)
      return '\\x'+hex2(ch);

    ASSERT.call(this, ch <= 0xFFFF, 'ch not a 16bit');
    return '\\u'+hex(ch);
  }
};
