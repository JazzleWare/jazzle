this . parseWithStatement = function() {
   if ( !this.ensureStmt_soft () &&
         this.err('not.stmt') )
     return this.errorHandlerOutput ;

   if (this.scope.insideStrict())
     this.err('with.strict')  ;

   this.enterScope(this.scope.bodyScope());
   this.fixupLabels(false);

   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();
   ! this.expectType_soft ('(') &&
   this.err('with.has.no.opening.paren');

   var obj = this.parseExpr(CTX_NONE|CTX_TOP);
   if (! this.expectType_soft (')' ) &&
         this.err('with.has.no.end.paren') )
     return this.errorHandlerOutput ;


   var nbody = this.parseStatement(true);
   this.foundStatement = true;

   var scope = this.exitScope();
   return  {
       type: 'WithStatement',
       loc: { start: startLoc, end: nbody.loc.end },
       start: startc,
       end: nbody.end,
       object: obj, body: nbody/*,scope:  scope ,y:-1*/
   };
};


