this. parseRegex_regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = s.length;
  if (c0+1 >= l)
    return this.setErrorRegex(this.parseRegex_errParen());
  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.parseRegex_regPeekOrGroup();
  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.parseRegex_regPattern();
  if (this.errorRegexElem)
    return this.regexErrorElem;

  this.regQuantifiable = true;
  var n = {
    type: '#Regex.Paren',
    capturing: true,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };

  if (!this.expectChar(CH_RPAREN))
    return this.parseRegex_errParenUnfinished(n);

  return n;
};

this. parseRegex_regPeekOrGroup =
function() {
  var c0 = this.c, s = this.src, l = s.length;
  switch (this.scat(c0+2)) {
  case CH_EQUALITY_SIGN:
    return this. parseRegex_regPeek(true);
  case CH_EXCLAMATION:
    return this. parseRegex_regPeek(false);
  case CH_COLON:
    return this. parseRegex_regGroup();
  default:
    var n = this. parseRegex_errPQ(); // (?
    return this.setErrorRegex(n);
  }
};
