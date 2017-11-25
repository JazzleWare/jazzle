  import {TK_ID} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

cls.parsePat_rest =
function() {
  this.v<=5 && this.err('ver.spread.rest');
  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // '...'

  if (this.v<7 && this.lttype !== TK_ID)
    this.err('rest.binding.arg.not.id');

  var arg = this.parsePat();

  if (arg === null)
    this.err('rest.has.no.arg');

  return {
    type: 'RestElement',
    argument: arg,
    start: c0,
    end: arg.end,
    loc: {
      start: loc0,
      end: arg.loc.end },
    '#c': cb,
    '#y': this.Y(arg)
  };
};


