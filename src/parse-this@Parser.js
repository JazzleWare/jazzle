this.parseThis = function() {
  var n = {
    type : 'ThisExpression',
    loc: { start: this.locBegin(), end: this.loc() },
    start: this.c0,
    end : this.c
  };
  this.next() ;

  if (this.scope.scs.isArrowComp())
    this.scope.reference_m(RS_LTHIS);

  return n;
};


