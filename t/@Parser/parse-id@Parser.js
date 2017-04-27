this.id = function() {
  var id = {
    type: 'Identifier', name: this.ltval,
    start: this.c0, end: this.c,
    loc: { start: this.locBegin(), end: this.loc() }, raw: this.ltraw
  };
  this.next() ;
  return id;
};


