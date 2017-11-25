  import {ASSERT_EQ, CH_COMMA, CH_RCURLY} from '../other/constants.js';
  import {cls} from './cls.js';

cls.regCurlyQuantifier =
function() {
  ASSERT_EQ.call(this, this.regCurlyChar, false);
  var c0 = this.c, c = c0, s = this.src, l = this.regLastOffset, li0 = this.li, col0 = this.col, luo0 = this.luo;
  c++; // '{'
  this.setsimpoff(c);
  VALID: {
    var minVal = this.regTryToParseNum();
    if (minVal === -1)
      break VALID;
    var minRaw = s.substring(c, this.c);
    c = this.c;
    if (c >= l)
      break VALID;
    var maxVal = -1, maxRaw = "";
    if (s.charCodeAt(c) === CH_COMMA) {
      c++; // ','
      this.setsimpoff(c);
      maxVal = this.regTryToParseNum();
      if (maxVal !== -1) {
        maxRaw = s.substring(c,this.c);
        c = this.c;
      }
      else
        maxRaw = 'inf';
    }
    if (c >= l)
      break VALID;
    if (s.charCodeAt(c) !== CH_RCURLY)
      break VALID;

    this.setsimpoff(c+1);

    if (maxVal >= 0 && maxVal < minVal)
      return this.regErr_curlyMinIsBiggerThanMax(); // TODO: max's location rather than }'s location

    var min = { raw: minRaw, value: minVal }, max = min;
    if (maxRaw !== "")
      max = maxVal === -1 ? null : { raw: maxRaw, value: maxVal };

    return {
      type: '#Regex.CurlyQuantifier',
      min: min,
      max: max,
      end: this.c,
      start: c0,
      loc: { start: { line: li0, column: col0 }, end: this.loc() }
    };
  }

  this.rw(c0,li0,col0,luo0);
  this.regCurlyChar = true;

  return null;
};


