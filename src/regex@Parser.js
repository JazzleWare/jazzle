// GENERAL RULE: if error occurs while parsing an elem, the parse routine sets the `regexErr and returns null
this. parseRegex =
function(rc, rli, rcol, regLen, nump, flags) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var luo0 = this.luo;
  var src0 = this.src;

  this.c = rc;
  this.li = rli;
  this.col = rcol;
  this.regLastOffset = regLen;
  this.setsimpoff(this.c);

  var e = 0, str = 'guymi';
  while (e < str.length) {
    this.regexFlags[str[e]] = flags.indexOf(str[e]) >= 0;
    e++;
  }

  var n = this.regPattern();

  this.c = c;
  this.li = li;
  this.col = col;

  this.luo = luo0;
  this.src = src0;

  // must never actually happen or else an error-regex-elem would have existed for it
  if (n.branches.length <= 0)
    this.err('regex.with.no.elements');
  if (this.regErr)
    return this.resetErrorRegex();

  return n;
};


