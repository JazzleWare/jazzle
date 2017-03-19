this.parseThis = function() {
  var n = {
    type : 'ThisExpression',
    loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0,
    end : this.c
  };
  this.next() ;

  this.scope.refDirect(RS_THIS, null);

  return n;
};


