  import {CH_MIN} from '../other/constants.js';
  import {cls} from './cls.js';

// characters do not test for early semi-ranges, because that makes things needlessly complicated -- after all, we are only a single character away
// from telling whether the semi range is deterministically erroneous, which is not much of a calculation
cls.regChar =
function(ce) { // class elem
  var c0 = this.c; 
  var s = this.src;
  var ch = s.charCodeAt(c0);

  if (ch >= 0x0d800 && ch <= 0x0dbff)
    return this.regSurrogateComponent_VOKE(ch, c0 + 1, 'lead', 'none');
  if (ch >= 0x0dc00 && ch <= 0x0dfff)
    return this.regSurrogateComponent_VOKE(ch, c0 + 1, 'trail', 'none');

  var l = this.regChar_VECI(s.charAt(c0), c0 + 1, ch, ce);
  if (ce && ch === CH_MIN)
    l.type = '#Regex.Hy'; // '-'
  return l;
};

cls.regChar_VECI =
function(value, offset, ch, ce) {
  var s = this.src, c0 = this.c;
  var loc0 = this.loc(), raw = s.substring(c0, offset);
  this.setsimpoff(offset);
  var li = this.li, col = this.col;
  var parent = ce ? null : this.regLEIAC();
  if (!ce && this.regPrepareQ()) // `parent &&` is necessary because we might be parsing a class element
    parent = null;

  if (parent) {
    parent.raw += raw;
    parent.charLength += 1;
    parent.value += value;
    parent.end += raw.length;
    parent.loc.end.column += raw.length;
    if (parent.cp !== -1)
      parent.cp = -1;
    return parent;
  }

  this.regIsQuantifiable = true;
  return {
    type: '#Regex.CharSeq',
    raw: raw,
    start: c0,
    end: offset,
    cp: ch,
    charLength: 1,
    loc: { start: loc0, end: { line: li, column: col } },
    value: value,
  };
};




