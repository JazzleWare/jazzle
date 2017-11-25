  import {CH_LCURLY, CH_RCURLY} from '../other/constants.js';
  import {cls} from './cls.js';

cls.parseDependent = 
function(name) {
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');

  if (!this.expectT(CH_LCURLY))
    this.err('block.dependent.no.opening.curly',{extra:{name:name}});

  var n = {
    type: 'BlockStatement',
    body: this.stmtList(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0,
      end: this.loc() },
    '#y': this.yc, '#scope': null, '#c': cb, '#lead': null
  };

  this.suc(cb, 'inner');

  if (!this.expectT(CH_RCURLY))
    this.err('block.dependent.is.unfinished',{tn:n, extra:{delim:'}'}});

  return n;
};


