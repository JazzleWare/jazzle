this.writeStringValue =
function(sv, ql) {
  var ch = -1, len = sv.length, c = 0, v = "";
  while (c < len) {
    ch = sv.charCodeAt(c);
    v = this.isNormalCh(ch) ?
      sv.charAt(c) :
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

this.writeString =
function(sv, quotation) {
  this.tt(ETK_STR);
  this.writeToCurrentLine_checked(quotation); // must take care of wrapping for the quotation
  this.writeStringValue(sv, quotation.length);

  // raw because the wrapping has been taken care of when in the writeStringValue routine
  this.writeToCurrentLine_raw(quotation); 
};

this.emitCommaList =
function(list, flags) {
  var e = 0;
  while (e < list.length) {
    if (e) this.wm(',','');
    this.eN(list[e], flags, false);
    if (e === 0) flags &= EC_IN;
    e++;
  }
};

this.emitStmtList =
function(list) {
  var own = {used: false};

  var lsn = this.listenForEmits(own), l = 0;
  while (l < list.length) {
    this.emitStmt(list[l++]);
    if (lsn.used) {
      own.used = false;
      this.trygu(wcb_afterStmt, own);
      lsn = this.listenForEmits(own);
    }
  }

  own.used || this.grmif(own);
};

this.emitStmt =
function(stmt) { return this.emitAny(stmt, EC_START_STMT, true); };
