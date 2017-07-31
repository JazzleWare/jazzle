this.resetLastRegexElem =
function() {
  var lbe = this.regLastBareElem;
  if (lbe !== null)
    this.regLastBareElem = null;

  return lbe;
};

this.regLEIAC =
function() {
  return (this.regLastBareElem && isCharSeq(this.regLastBareElem)) ?
    this.regLastBareElem : null;
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

this.regTryToParseNum =
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