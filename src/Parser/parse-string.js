
this.parseString =
function(startChar) {
  var c = this.c, s = this.src, l = s.length, v = "";
  var luo = c, surrogateTail = -1, ch = -1;

  var cb = {}; this.suc(cb, 'bef');

  LOOP:
  while (c<l) {
    ch = s.charCodeAt(c);
    if (ch === CH_BACK_SLASH) {
      if (luo < c)
        v += s.substring(luo,c);
      this.setsimpoff(c);
      v += this.readEsc(false);
      c = luo = this.c;
    }
    else
      switch (ch) {
      case startChar:
        if (luo < c)
          v += s.substring(luo,c);
        c++;
        break LOOP;

      case CH_CARRIAGE_RETURN:
      case CH_LINE_FEED:
      case 0x2028: case 0x2029:
        this.setsimpoff(c);
        this.err('str.newline');

      default: c++;
      }
  }

  this.setsimpoff(c);
  if (ch !== startChar)
    this.err('str.unfinished');

  var n = {
    type: 'Literal',
    value: v,
    start: this.c0,
    end: c,
    raw: this.c0_to_c(),
    loc: {
      start: { line: this.li0, column: this.col0 },
      end: { line: this.li, column: this.col }
    }, '#c': cb
  };

  // not the most elegant solution, but for what it does (catching legacy numbers),
  // it is fitting; a better solution which won't require re-parsing the number
  // will eventually come instead of the block below (NUM_START token, much like the way the strings are handled)
  if (this.chkDirective) {
    this.chkDirective = false;
    if (c<l) {
      this.skipWS();
      c = this.c;
      if (this.scat(c) === CH_0) {
        this.applyDirective(n);
        this.alreadyApplied = true;
      }
    }
  }
  this.next();

  return n;
};

