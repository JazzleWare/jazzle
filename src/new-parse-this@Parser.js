this.parseThis = function() {
  this.resvchk();
  var n = {
    type : 'ThisExpression',
    loc: { start: this.loc0(), end: this.loc() },
    start: this.c0,
    end : this.c
  };

  this.next() ;
  this.scope.refDirect_m(RS_THIS, null);
  return n;
};


