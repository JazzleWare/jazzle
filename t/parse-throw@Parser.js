this.parseThrowStatement = function () {
  if ( ! this.ensureStmt_soft () &&
         this.err('not.stmt') )
    return this.errorHandlerOutput ;

  this.fixupLabels(false ) ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      retVal = null,
      li = this.li,
      c = this.c,
      col = this.col;

  this.next();

  var semi = 0 , semiLoc = null ;
  if ( this.nl &&
       this.err('throw.has.newline') )
    return this.errorHandlerOutput;

  retVal = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  if ( retVal === null &&
       this.err('throw.has.no.argument') )
     return this.errorHandlerOutput;

  semi = this.semiI();
  semiLoc = this.semiLoc_soft();
  if ( !semiLoc && !this.nl &&
        this.err('no.semi') )
    return this.errorHandlerOutput;

  this.foundStatement = true;
  return { type: 'ThrowStatement', argument: core(retVal), start: startc, end: semi || retVal.end,
     loc: { start: startLoc, end: semiLoc || retVal.loc.end } }

};


