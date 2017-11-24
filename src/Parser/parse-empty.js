  import {cls} from './cls.js';

this.parseEmptyStatement =
function() {
  var n = {
    type: 'EmptyStatement',
    start: this.c0,
    loc: { start: this.loc0(), end: this.loc() },
    end: this.c,
    '#y': 0, '#c': {}
  };
  this.spc(n, 'bef');
  this.next();
  return n;
};

