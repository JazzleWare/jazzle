  import {HAS} from '../other/constants.js';
  import {cls} from './ctor.js';

// GENERAL RULE: if error occurs while parsing an elem, the parse routine sets the `regexErr and returns null
cls. parseRegex =
function(rc, rli, rcol, regLast, nump, flags, 
  /* tail (flags) */
  tc, tli, tcol) {
  var c = this.c;
  var li = this.li;
  var col = this.col;
  var luo0 = this.luo;
  var src0 = this.src;

  var e = 0, str = 'guymi';
  while (e < str.length) 
    this.rf[str[e++]] = false;
  e = 0;

  this.li = tli;
  this.col = tcol;
  this.c = tc;
  this.luo = this.c;

  var n = null;
  while (e < flags.length) {
    var fl = flags[e];
    if (!HAS.call(this.rf, fl)) {
      this.setsimpoff(tc+e);
      n = { type: '#Regex.Err', kind: 'flagunknown', loc: this.loc(), position: tc + e, ctx: { flag: fl } };
      break;
    }
    if (this.rf[fl]) {
      this.setsimpoff(tc+e);
      n = { type: '#Regex.Err', kind: 'flagduplicate', loc: this.loc(), position: tc + e, ctx: { flag: fl } };
      break;
    }
    this.rf[fl] = true;
    e++;
  }

  if (n === null) {
    this.c = rc;
    this.li = rli;
    this.col = rcol;
    this.regLastOffset = regLast - 1 - flags.length; // -('/'.length+flags.length)
    this.regNC = nump;

    this.luo = this.c;

    var n = this.regPattern();
    
    if (this.regErr) { n = this.regErr; this.regErr = null; }
    else if (this.c !== this.regLastOffset) {
      this.err('regex.no.complete.parse');
      // must never actually happen or else an error-regex-elem would have existed for it
      if (n.branches.length <= 0)
        this.err('regex.with.no.elements');
    }
  }

  this.c = c;
  this.li = li;
  this.col = col;

  this.luo = luo0;
  this.src = src0;

  return n;
};




