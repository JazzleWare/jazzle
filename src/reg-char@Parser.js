this. parseRegex_regChar =
function(isBare) {
  var c0 = this.c; 
  var s = this.src;
  var ch = s.charCodeAt(c0);

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponentVOKE(ch, c0 + 1, 'lead', 'none');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponentVOKE(ch, c0 + 1, 'trail', 'none');

  var l = this.parseRegex_regChar_attachOrMakeVLCPR(
    s.charAt(c0), 1, ch,
    isBare ? this.regLEIAC() : null, c0, c0 + 1);
  if (!isBare && ch === CH_MIN)
    l.type = '#Regex.Hy'; // '-'
  return l;
};

this. parseRegex_regChar_attachOrMakeVLCPR =
function(val, len, ch, parent, rs, re) {
  var s = this.src, raw = s.substring(rs, re);
  var loc0 = this.loc();
  this.setsimpoff(re);
  var li = this.li, col = this.col;
  if (this.parseRegex_tryPrepareQuantifier())
    parent = null;

  if (parent) {
    parent.raw += raw;
    parent.charLength += len;
    parent.value += val;
    parent.end += raw.length;
    parent.loc.end += raw.length;
    if (parent.cp !== -1)
      parent.cp = -1;
    return parent;
  }

  this.regQuantifiable = true;
  return {
    type: '#Regex.CharSeq',
    raw: s.substring(rs,re),
    start: rs,
    end: re,
    cp: ch,
    charLength: len,
    loc: { start: loc0, end: { line: li, column: col } },
    value: val,
  };
};


