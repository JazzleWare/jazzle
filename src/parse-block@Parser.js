this.parseBlockStatement = function () {
  this.fixupLabels(false);

  this.enterScope(this.scope.blockScope()); 

  var startc = this.c - 1,
      startLoc = this.locOn(1);
  this.next();

  var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/};

  if ( !this.expectType_soft ('}' ) &&
        this.err('block.unfinished',{tn:n,extra:{delim:'}'}}))
    return this.errorHandlerOutput ;

  this.exitScope(); 

  return n;
};
