  import {PREC_NONE} from '../other/lexer-constants.js';
  import {CTX_TOP} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

this.parsePat_assig = 
function (head) {
  if (this.v <= 5)
    this.err('ver.assig');
  this.spc(head, 'aft');
  this.next() ;
  var e = this.parseNonSeq(PREC_NONE, CTX_TOP);
  this.inferName(head, core(e), false);
  return {
    type: 'AssignmentPattern',
    start: head.start,
    left: head,
    end: e.end,
    right: core(e),
    loc: {
      start: head.loc.start,
      end: e.loc.end },
    '#y': this.Y(head,e), '#c': {}
  };
};

