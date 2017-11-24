  import {CH_ADD, CH_QUESTION, CH_MUL, CH_LCURLY, ASSERT} from '../other/constants.js';
  import {cls} from './cls.js';

this.regPrepareQ =
function() {
  var c = this.c, s = this.src, l = this.regLastOffset;
  if (c >= l)
    return false;
  switch (s.charCodeAt(c)) {
  case CH_ADD:
  case CH_QUESTION:
  case CH_MUL:
    this.regPendingCQ = true; // peek charQuantifier
    return true;
  case CH_LCURLY:
    this.regPendingBQ = this.regCurlyQuantifier();
    return this.regPendingBQ !== null;
  }
  return false;
};

this.regQuantify =
function(elem) {
  var c = this.c, li = this.li, col = this.col;
  var loc = null, s = this.src;
  var t = '', bq = null;

  if (this.regPendingCQ) {
    ASSERT.call(this, this.regPendingBQ === null, 'hasPBQnt');
    this.regPendingCQ = false;
    t = s.charAt(c);
    c++;
    this.setsimpoff(c);
    loc = this.loc();
  } 
  else if (this.regPendingBQ) {
    ASSERT.call(this, !this.regPendingCQ, 'hasPCQnt');
    t = '{}';
    bq = this.regPendingBQ;
    this.regPendingBQ = null;
    loc = bq.loc.end;
  }
  else 
    ASSERT.call(this, false, 'neither PCQnt nor PBQnt');

  var greedy = true;
  if (this.scat(this.c) === CH_QUESTION) {
    if (bq)
      loc = { line: loc.line, column: loc.column };
    c++;
    this.setsimpoff(c);
    loc.column++;
    greedy = false;
  }

  return {
    type: '#Regex.Quantified' ,
    rangeQuantifier: bq,
    quantifier: t,
    pattern: elem,
    start: elem.start,
    loc: { start: elem.loc.start, end: loc },
    end: this.c,
    greedy: greedy
  };
};



