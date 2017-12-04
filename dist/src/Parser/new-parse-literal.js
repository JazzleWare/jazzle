  import {cls} from './cls.js';

cls.getLit_true = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef' );
  var n = {
    type: 'Literal', value: true,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

cls.getLit_false = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Literal', value: false,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

cls.getLit_null = function() {
  this.resvchk();
  var cb = {}; this.suc(cb, 'bef');
  var n = {
    type: 'Literal', value: null,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};

cls.getLit_num = function () {
  var cb = {}; this.suc(cb, 'bef' );
  var n = {
    type: 'Literal', value: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.loc0(), end: this.loc() },
    raw: this.ltraw, '#c': cb
  };
  this.next();
  return n;
};


