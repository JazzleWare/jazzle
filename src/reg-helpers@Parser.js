this.resetLastRegexElem =
function() {
  var lastRegexElem = this.lastRegexElem;
  if (lastRegexElem !== null)
    this.lastRegexElem = null;
  return lastRegexElem;
};

this.regLEIAC =
function() {
  return (this.lastRegexElem && rec(this.lastRegexElem)) ?
    this.lastRegexElem : null;
};

this.expectChar =
function(ch) {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return false;
  if (s.charCodeAt(c) === ch) {
    this.setsimpoff(c+1);
    return true;
  }
  return false;
};

this. parseRegex_tryParseNum =
function() {
  var c = this.c, s = this.src, l = s.length;
  if (c >= l)
    return -1;
  var v = 0, ch = s.charCodeAt(c);
  if (!isNum(ch))
    return -1;
  var mul = 1;

  do {
    v *= mul;
    v += (ch - CH_0);
    if (v) mul *= 10; // leading zeros not significant
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  return v;
};


