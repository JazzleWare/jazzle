this.parseTryStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false);
  var startc = this.c0,
      startLoc = this.locBegin();

  this.next() ;

  this.enterScope(this.scope.blockScope()); 
  var tryBlock = this.parseBlockStatement_dependent('try');
  this.exitScope(); 

  var finBlock = null, catBlock  = null;
  if (this.lttype === 'Identifier' && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  if (this.lttype === 'Identifier' && this.ltval === 'finally') {
    this.next();
    this.enterScope(this.scope.blockScope()); 
    finBlock = this.parseBlockStatement_dependent('finally');
    this.exitScope(); 
  }

  var finOrCat = finBlock || catBlock;
  if ( ! finOrCat &&
       this.err('try.has.no.tail')  )
    return this.errorHandlerOutput ;

  this.foundStatement = true;
  return  { type: 'TryStatement', block: tryBlock, start: startc, end: finOrCat.end,
            handler: catBlock, finalizer: finBlock, loc: { start: startLoc, end: finOrCat.loc.end } /* ,y:-1*/};
};


