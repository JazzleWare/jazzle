  import {core} from '../other/util.js';
  import {PREC_NONE} from '../other/lexer-constants.js';
  import {CTX_TOP, CH_COLON, CTX_FOR} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.parseCond = function(cond, ctx) {
  this.spc(core(cond), 'aft');
  this.next(); // '?'

  var seq = this.parseNonSeq(PREC_NONE, CTX_TOP);
  this.spc(core(seq), 'aft');
  if (!this.expectT(CH_COLON))
    this.err('cond.colon',{extra:[cond,seq,context]});

  var alt = this.parseNonSeq(PREC_NONE, (ctx&CTX_FOR)|CTX_TOP);
  return {
    type: 'ConditionalExpression',
    test: core(cond),
    start: cond.start,
    end: alt.end,
    loc: {
      start: cond.loc.start,
      end: alt.loc.end },
    consequent: core(seq),
    alternate: core(alt),
    '#y': this.Y(cond,alt,seq), '#c': {}
  };
};


