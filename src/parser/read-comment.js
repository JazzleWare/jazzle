this.readComment_line =
function() {
  var c = this.c, s = this.src, l = s.length;
  var li0 = this.li, col0 = this.col, c0 = c;

  COMMENT:
  while (c<l)
    switch (s.charCodeAt(c)) {
    case CH_CARRIAGE_RETURN:
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      break COMMENT;
    default: c++;
    }

  this.setsimpoff(c);
  this.foundComment(c0,li0,col0,c,'Line');
};

this.readComment_multi =
function() {
  var c = this.c, s = this.src, l = s.length;
  var li0 = this.li, col0 = this.col, c0 = c, hasNL = false, finished = false;
  var l0o = -1; // line 0 offset
  COMMENT:
  while (c<l)
    switch (s.charCodeAt(c)) {
    case CH_CARRIAGE_RETURN:
      if (c+1<l && s.charCodeAt(c+1) === CH_LINE_FEED)
        c++;
    case CH_LINE_FEED:
    case 0x2028: case 0x2029:
      c++;
      this.setzoff(c);
      if (!hasNL) {
        hasNL = true;
        l0o = c;
      }
      continue;

    case CH_MUL:
      if (c+1<l && s.charCodeAt(c+1) === CH_DIV) {
        c += 2; // '*/'
        finished = true;
        break COMMENT;
      }
    default: c++;
    }

  this.setsimpoff(c);
  if (!finished)
    this.err('comment.multi.is.unfinished');

  if (!hasNL)
    l0o = c;
  else
    l0o--; // do not count the break

  this.foundComment(c0,li0,col0,l0o,'Block');
  return hasNL;
};

this.foundComment =
function(c0,li0,col0,l0o,t) {
  var c = this.c, li = this.li, col = this.col;
  if (this.commentBuf === null)
    this.commentBuf = new Comments();

  var line = t === 'Line';
  var comment = {
    type: t,
    value: this.src.substring(c0, line ? c : c-2),
    start: c0,
    end: c,
    loc: {
      start: { line: li0, column: col0 },
      end: { line: li, column: col }
    },
    '#firstLen': l0o - c0 + 2
  };

  this.commentBuf.push(comment);
  this.commentCallback && this.commentCallback(comment);
};
