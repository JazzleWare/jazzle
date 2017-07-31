// GENERAL RULE: if error occurs while parsing an elem, the parse routine sets the `regexErr and returns null

this. parseRegex =
function(rc, rli, rcol, rsrc, flags) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var src0 = this.src;

  this.src = rsrc;

  this.c = rc;
  this.li = rli;
  this.col = rcol;

  var e = 0, str = 'guymi';
  while (e < str.length) {
    this.regexFlags[str[e]] = flags.indexOf(str[e]) >= 0;
    e++;
  }

  var n = this.parseRegex_regPattern();

  this.c = c;
  this.li = li;
  this.col = col;

  // must never actually happen or else an error-regex-elem would have existed for it
  if (n.branches.length <= 0)
    this.err('regex.with.no.elements');
  if (this.errorRegexElem)
    return this.resetErrorRegex();

  return n;
};


