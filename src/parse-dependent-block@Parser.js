this. parseBlockStatement_dependent = function(name) {
    var startc = this.c - 1,
        startLoc = this.locOn(1);

    if (!this.expectType_soft ('{'))
      this.err('block.dependent.no.opening.curly',{extra:{name:name}});

    var n = { type: 'BlockStatement', body: this.blck(), start: startc, end: this.c,
        loc: { start: startLoc, end: this.loc() }/*,scope:  this.scope  ,y:-1*/ };
    if ( ! this.expectType_soft ('}') &&
         this.err('block.dependent.is.unfinished',{tn:n, extra:{delim:'}'}})  )
      return this.errorHandlerOutput;

    return n;
};
