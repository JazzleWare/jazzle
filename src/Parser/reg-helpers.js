  import {isCharSeq} from '../other/util.js';
  import {isNum} from '../other/ctype.js';
  import {CH_0} from '../other/constants.js';
  import {cls} from './cls.js';

cls.resetLastRegexElem =
function() {
  var lbe = this.regLastBareElem;
  if (lbe !== null)
    this.regLastBareElem = null;

  return lbe;
};

cls.regLEIAC =
function() {
  return (this.regLastBareElem && isCharSeq(this.regLastBareElem)) ?
    this.regLastBareElem : null;
};

cls.expectChar =
function(ch) {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return false;
  if (s.charCodeAt(c) === ch) {
    this.setsimpoff(c+1);
    return true;
  }
  return false;
};

cls.regTryToParseNum =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return -1;
  var v = 0, ch = s.charCodeAt(c);
  if (!isNum(ch))
    return -1;
  do {
    v *= 10;
    v += (ch - CH_0);
    c++;
    if (c >= l)
      break;
    ch = s.charCodeAt(c);
  } while (isNum(ch));

  this.setsimpoff(c);
  return v;
};


