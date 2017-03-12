this. parseCatchClause = function () {
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next();

   this.enterScope(this.scope.catchHeadScope());
   if ( !this.expectType_soft ('(') &&
        this.err('catch.has.no.opening.paren',{c0:startc,loc0:startLoc}) )
     return this.errorHandlerOutput ;

   this.declMode = DM_CATCHARG;
   var catParam = this.parsePattern();
   if (this.lttype === 'op' && this.ltraw === '=')
     this.err('catch.has.an.assig.param',{c0:startc,loc0:startLoc,extra:catParam});

   this.declMode = DM_NONE;
   if (catParam === null)
     this.err('catch.has.no.param',{c0:startc,loc0:startLoc});

   if (!this.expectType_soft (')'))
     this.err('catch.has.no.end.paren',{c0:startc,loc0:startLoc,extra:catParam});
   this.exitScope();

   this.enterScope(this.scope.catchBodyScope());
   var catBlock = this.parseBlockStatement_dependent('catch');
   this.exitScope();

   return {
       type: 'CatchClause',
        loc: { start: startLoc, end: catBlock.loc.end },
       start: startc,
       end: catBlock.end,
       param: catParam ,
       body: catBlock/* ,y:-1*/
   };
};

