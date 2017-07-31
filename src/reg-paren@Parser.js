this.regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = s.length;

  if (c0+1 >= l)
    return this.regErr_EOFParen();

  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.regPeekOrGroup();

  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.regPattern();
  if (this.regErr)
    return null;

  this.regIsQuantifiable = true;
  var n = {
    type: '#Regex.Paren',
    capturing: true,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };

  if (!this.expectChar(CH_RPAREN))
    return this.regErr_unfinishedParen(n);

  return n;
};

this.regPeekOrGroup =
function() {
  var c0 = this.c, s = this.src, l = s.length;
  switch (this.scat(c0+2)) {
  case CH_EQUALITY_SIGN:
    return this.regPeek(true);
  case CH_EXCLAMATION:
    return this.regPeek(false);
  case CH_COLON:
    return this.regGroup();
  default:
    return this.regErr_invalidCharAfterQuestionParen(); // (?
  }
};
