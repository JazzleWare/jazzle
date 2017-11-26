  import {CH_LSQBRACKET, CH_BACK_SLASH, CH_RSQBRACKET, CH_DIV, CH_LPAREN, CH_QUESTION, CH_CARRIAGE_RETURN, CH_LINE_FEED} from '../other/constants.js';
  import {isIDBody} from '../other/ctype.js';
  import {cls} from './cls.js';

// /\1200(*followed by 1200 ()'s)/ becomes /(*backref=\1200)(*1200 ()'s)/; but, /\1200(*followed by 1199 ()'s)/ becomes /(*legacyEsc=\120)(*ch='0')(*1199 ()'s);
// this means any captureP had better get tracked below, rather than in `parseRegex`

cls.parseRegexLiteral =
function() {
  this.v < 2 && this.err('ver.regex');
  var c = this.c, b = {}, s = this.src, nump = 0, l = s.length;
  var c0 = this.c0, inClass = false, loc0 = this.loc0();
  this.suc(b, 'bef');

  var esc = false;

  REGEX:
  while (c < l) {
    switch (s.charCodeAt(c)) {
    case CH_LSQBRACKET:
      if (esc) { esc = false; break }
      if (!inClass) inClass = true;
      break;
    case CH_BACK_SLASH:
      if (esc) { esc = false; break; }
      esc = true;
      break;
    case CH_RSQBRACKET:
      if (esc) { esc = false; break; }
      if (inClass) inClass = false;
      break;
    case CH_DIV:
      if (esc) { esc = false; break; }
      if (inClass) break;
      break REGEX;
    case CH_LPAREN:
      if (esc || inClass || c+1 >= l) break;
      if (s.charCodeAt(c+1) !== CH_QUESTION)  nump++;
      break;
    case CH_CARRIAGE_RETURN:
      c+1 < l && s.charCodeAt(c+1) === CH_LINE_FEED && c++;
    case CH_LINE_FEED:
    case 0x2028:
    case 0x2029:
      this.err(esc ? 'regex.esc.newline' : 'regex.newline', {c0:c});
    default:
      if (esc) { esc = false; }
    }
    c++;
  }

  if (c >= l || s.charCodeAt(c) !== CH_DIV)
    this.err('regex.unfinished');

  var pattern = s.substring(this.c, c);
  c++; // '/'

  var patternStart = this.c;
  this.setsimpoff(c);

  var flags = "", flagsStart = c;
  while (c < l && isIDBody(s.charCodeAt(c))) c++;
  flags = s.substring(flagsStart, c);

  var n = this.parseRegex(patternStart, loc0.line, loc0.column+1, c, nump, flags, this.c, this.li, this.col);
  this.setsimpoff(c);
  var regex = {
    type: 'Literal',
    regex: {
      pattern: pattern,
      flags: flags 
    },
    start: c0,
    end: c,
    value: null,
    loc: { start: loc0, end: this.loc() }, 
    raw: this.src.substring(c0, c),
    '#c': b, '#n': n
   };

   this.next () ;
   return regex ;
};


