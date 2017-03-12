this.parseDoWhileStatement = function () {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.enterScope(this.scope.bodyScope());
  this.allow(SA_BREAK|SA_CONTINUE);
  this.fixupLabels(true);

  var startc = this.c0,
      startLoc = this.locBegin() ;
  this.next() ;
  var nbody = this.parseStatement (true) ;
  if (this.lttype === 'Identifier' && this.ltval === 'while') {
    this.kw(); this.next();
  }
  else
    this.err('do.has.no.while',{extra:[startc,startLoc,nbody]});

  if ( !this.expectType_soft('(') &&
        this.err('do.has.no.opening.paren',{extra:[startc,startLoc,nbody]}) )
    return this.errorHandlerOutput;

  var cond = core(this.parseExpr(CTX_NONE|CTX_TOP));
  var c = this.c, li = this.li, col = this.col;
  if ( !this.expectType_soft (')') &&
        this.err('do.has.no.closing.paren',{extra:[startc,startLoc,nbody,cond]}) )
    return this.errorHandlerOutput;

  if (this.lttype === ';' ) {
     c = this.c;
     li = this.li ;
     col = this.col;
     this.next();
  }

 this.foundStatement = true;
 this.exitScope(); 

 return { type: 'DoWhileStatement', test: cond, start: startc, end: c,
          body: nbody, loc: { start: startLoc, end: { line: li, column: col } } /* ,y:-1*/} ;
};
