  import {CH_QUESTION, CH_RPAREN, CH_EQUALITY_SIGN, CH_EXCLAMATION, CH_COLON} from '../other/constants.js';
  import {cls} from './cls.js';

cls.regParen =
function() {
  var c0 = this.c;
  var s = this.src;
  var l = this.regLastOffset;

  if (c0+1 >= l)
    return this.regErr_unfinishedParen();

  if (s.charCodeAt(c0+1) === CH_QUESTION)
    return this.regPeekOrGroup();

  var loc0 = this.loc();
  this.setsimpoff(c0+1);

  var elem = this.regPattern();
  if (this.regErr)
    return null;

  this.regIsQuantifiable = true;
  var finished = this.expectChar(CH_RPAREN);
  var n = {
    type: '#Regex.Paren',
    capturing: true,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };

  if (finished)
    return n;

  return this.regErr_unfinishedParen(n);
};

cls.regPeekOrGroup =
function() {
  var c0 = this.c, s = this.src, l = this.regLastOffset;
  var r = this.scat(c0+2);
  switch (r) {
  case CH_EQUALITY_SIGN:
    return this.regPeek(true);
  case CH_EXCLAMATION:
    return this.regPeek(false);
  case CH_COLON:
    return this.regGroup();
  default:
    return this.regErr_invalidCharAfterQuestionParen(r); // (?
  }
};

cls.regPeek =
function(notInverse) {
  var c0 = this.c, loc0 = this.loc(), n = null, elem = null, finished = false;
  this.setsimpoff(c0+3);
  elem = this.regPattern();
  finished = this.expectChar(CH_RPAREN);
  n = {
    type: '#Regex.Peek',
    inverse: !notInverse,
    start: c0,
    pattern: elem,
    end: this.c,
    loc: { start: loc0, end: this.loc() }
  };
  this.regIsQuantifiable = !this.rf.u;

  if (finished) return n;
  return this.regErr_unfinishedParen(n);
};

cls.regGroup = 
function() {
  var c0 = this.c, loc0 = this.loc(), n = null, elem = null, finished = false;
  this.setsimpoff(c0+3);
  elem = this.regPattern();
  finished = this.expectChar(CH_RPAREN);
  n = {
    type: '#Regex.Paren',
    capturing: false,
    start: c0,
    end: this.c,
    pattern: elem,
    loc: { start: loc0, end: this.loc() }
  };
  this.regIsQuantifiable = !this.rf.u;

  if (finished) return n;
  return this.regErr_unfinishedParen(n);
};


