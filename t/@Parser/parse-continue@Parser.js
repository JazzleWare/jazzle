this.parseContinueStatement = function () {
   if (!this.ensureStmt_soft())
     this.err('not.stmt');

   this.fixupLabels(false);

   if (!this.scope.canContinue())
     this.err('continue.not.in.loop');

   var startc = this.c0, startLoc = this.locBegin();
   var c = this.c, li = this.li, col = this.col;

   this.next() ;

   var name = null, label = null, semi = 0;

   var semiLoc = null;

   if ( !this.nl && this.lttype === 'Identifier' ) {
       label = this.validateID("");
       name = this.findLabel(label.name + '%');
       if (!name) this.err('continue.no.such.label',{tn:label,extra:{c0:startc,loc0:startLoc}}) ;

       // TODO: tell what it is labeling
       if (!name.loop) this.err('continue.not.a.loop.label',{tn:label,extra:{c0:startc,loc0:startLoc}});

       semi = this.semiI();
       semiLoc = this.semiLoc_soft();
       if ( !semiLoc && !this.nl &&
             this.err('no.semi') )
         return this.errorHandlerOutput;

       this.foundStatement = true;
       return { type: 'ContinueStatement', label: label, start: startc, end: semi || label.end,
           loc: { start: startLoc, end: semiLoc || label.loc.end } };
   }
   semi = this.semiI();
   semiLoc = this.semiLoc_soft();
   if ( !semiLoc && !this.nl &&
         this.err('no.semi') )
     return this.errorHandlerOutput;

   this.foundStatement = true;
   return { type: 'ContinueStatement', label: null, start: startc, end: semi || c,
           loc: { start: startLoc, end: semiLoc || { line: li, column : col } } };
};
