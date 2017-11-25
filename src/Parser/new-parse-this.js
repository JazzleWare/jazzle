  import {RS_THIS} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.parseThis = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef' );

  var n = {
    type : 'ThisExpression',
    loc: { start: this.loc0(), end: this.loc() },
    start: this.c0,
    end : this.c, '#c': cb
  };

  this.next() ;
  this.scope.refDirect_m(RS_THIS, null);
  return n;
};




