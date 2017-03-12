this.parseWhileStatement = function () {
   this.enterScope(this.scope.bodyScope());
   this.allow(SA_BREAK|SA_CONTINUE);
   if (!this.ensureStmt_soft())
     this.err('not.stmt');

   this.fixupLabels(true);

   var startc = this.c0,
       startLoc = this.locBegin();
   this.next();

   !this.expectType_soft ('(') &&
   this.err('while.has.no.opening.paren');
 
   var cond = core( this.parseExpr(CTX_NONE|CTX_TOP) );

   !this.expectType_soft (')') &&
   this.err('while.has.no.closing.paren');

   var nbody = this.parseStatement(false);
   this.foundStatement = true;

   var scope = this.exitScope();
   return { type: 'WhileStatement', test: cond, start: startc, end: nbody.end,
       loc: { start: startLoc, end: nbody.loc.end }, body:nbody/*,scope:  scope ,y:-1*/ };
};
