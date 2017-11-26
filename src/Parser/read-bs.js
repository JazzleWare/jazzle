  import {CH_LCURLY, CH_RCURLY} from '../other/constants.js';
  import {hex2num} from '../other/util.js';
  import {cls} from './cls.js';

cls.readBS = function() {
  var c = this.c, s = this.src, l = s.length;
  c++; // \
  if (c >= l)
    this.err('u.expected.got.eof');

  c++;
  if (s.charCodeAt(c) === CH_LCURLY)
    return this.readBS_lcurly(c);

  var val = 0;
  var c0 = c;
  while (c-c0 < 4) {
    if (c >= l) {
      this.setsimpoff(c);
      this.err('hex.expected.got.eof');
    }

    var b = hex2num(s.charCodeAt(c));
    if (b === -1) {
      this.setsimpoff(c);
      this.err('hex.expected.got.something.else');
    }

    val = (val<<4)|b;
    c++;
  }

  this.setsimpoff(c);
  return val;
};

cls.readBS_lcurly =
function(c) {
  var s = this.src, l = s.length;
  c++; // {
  if (c >= l) {
    this.setsimpoff(c);
    this.err('hex.expected.got.eof');
  }

  var val = 0;
  var b = s.charCodeAt(c);
  while (true) {
    b = hex2num(b);
    if (b === -1) {
      this.setsimpoff(c);
      this.err('hex.expected.got.something.else');
    }
    var t = (val<<4)|b;
    if (t <= 1114111)
      val = t
    else {
      this.setsimpoff(c);
      this.err('curly.big');
    }
    c++;
    if (c >= l) {
      this.setsimpoff(c);
      this.err('curly.expected.got.eof');
    }
    b = s.charCodeAt(c);
    if (b === CH_RCURLY)
      break;
  }

  c++; // }
  this.setsimpoff(c);

  return val;
};


