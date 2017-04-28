this.getLit_true = function() {
  this.resvchk();
  var n = {
    type: 'Literal', value: true,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getNum_false = function() {
  
  var n = {
    type: 'Literal', value: false,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getLit_null = function() {
  this.resvchk();
  var n = {
    type: 'Literal', value: null,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};

this.getLit_num = function () {
  var n = {
    type: 'Literal', value: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() },
    raw: this.ltraw
  };
  this.next();
  return n;
};
