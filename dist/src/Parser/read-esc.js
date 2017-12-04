  import {CH_BACK_SLASH, CH_MULTI_QUOTE, CH_SINGLE_QUOTE, CH_v, CH_b, CH_f, CH_t, CH_r, CH_n, CH_u, CH_x, CH_0, CH_8, CH_1, CH_2, CH_3, CH_4, CH_5, CH_6, CH_7, CH_9, CH_CARRIAGE_RETURN, CH_LINE_FEED} from '../other/constants.js';
  import {cp2sp, hex2num} from '../other/util.js';
  import {ERR_NONE_YET, ERR_PIN_OCTAL_IN_STRICT} from '../other/error-constants.js';
  import {cls} from './cls.js';

cls.readEsc =
function(t) { // is it a template escape?
  var c = this.c,
      s = this.src,
      l = s.length,
      v = '',
      setoff = true;

  if (c+1>=l)
    this.err('slash.eof');

  var ch1 = -1, ch2 = -1;
  switch (s.charCodeAt(c+1)) {
  case CH_BACK_SLASH: c+=2; v = '\\'; break;
  case CH_MULTI_QUOTE: c+=2; v = '\"'; break;
  case CH_SINGLE_QUOTE: c+=2; v = '\''; break;
  case CH_v: c+=2; v = '\v'; break;
  case CH_b: c+=2; v = '\b'; break;
  case CH_f: c+=2; v = '\f'; break;
  case CH_t: c+=2; v = '\t'; break;
  case CH_r: c+=2; v = '\r'; break;
  case CH_n: c+=2; v = '\n'; break;

  case CH_u:
    v = cp2sp(this.readBS());
    setoff = false;
    break;

  case CH_x:
    c+=2; // \x
    if (c>=l)
      this.err('x.esc.first.got.eof');
    ch1 = hex2num(s.charCodeAt(c));
    if (ch1 === -1)
      this.err('x.esc.first.got.nonhex');
    c++;
    if (c>=l)
      this.err('x.esc.next.got.eof');
    ch2 = hex2num(s.charCodeAt(c));
    if (ch2 === -1)
      this.err('x.esc.next.got.nonhex');
    c++;
    v = String.fromCharCode((ch1<<4)|ch2);
    break;

  case CH_0:
    if (c+2>=l ||
       (ch1=s.charCodeAt(c+2), ch1 < CH_0 || ch1 >= CH_8)) {
      c += 2;
      v = '\0';
      break;
    }
  case CH_1:
  case CH_2:
  case CH_3:
  case CH_4:
  case CH_5:
  case CH_6:
  case CH_7:
    t && this.err('template.esc.is.legacy');
    v = this.readEsc_legacy();
    setoff = false;
    break;

  case CH_8:
  case CH_9:
    this.err('esc.8.or.9');
    break;

  case CH_CARRIAGE_RETURN:
    if (
      c+2<l &&
      s.charCodeAt(c+2) === CH_LINE_FEED
    ) c++;
  case CH_LINE_FEED:
  case 0x2028: case 0x2029:
    c++;
    this.setzoff(c+1);
    v = '';
    setoff = false;
    break;

  default:
    v = s.charAt(c+1);
    c+=2;
  }

  if (setoff)
    this.setsimpoff(c);

  return v;
};

cls.readEsc_legacy =
function() {
  if (this.scope.insideStrict())
    this.err('esc.legacy.not.allowed.in.strict.mode');

  if (this.scope.insidePrologue() &&
    this.ct === ERR_NONE_YET) {
    this.ct = ERR_PIN_OCTAL_IN_STRICT;
    this.pin_ct(this.c,this.li,this.col);
  }

  var c = this.c+1, s = this.src, l = s.length, v = -1;

  v = s.charCodeAt(c) - CH_0;
  var max = v >= 4 ? 1 : 2;
  c++;
  while (c<l && max--) {
    var ch = s.charCodeAt(c);
    if (ch < CH_0 || ch >= CH_8)
      break;
    v = (v<<3)|(ch-CH_0);
    c++;
  }

  this.setsimpoff(c);

  return String.fromCharCode(v);
};


