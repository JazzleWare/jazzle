// TODO: needs reconsideration,
this.parseRestElement = function() {
   if (this.v <= 5)
     this.err('ver.spread.rest');
   var startc = this.c0,
       startLoc = this.locBegin();

   this.next ();
   if ( this.v < 7 && this.lttype !== 'Identifier' ) {
      this.err('rest.binding.arg.peek.is.not.id');
   }

   var e = this.parsePattern();

   if (!e) {
      if (this.err('rest.has.no.arg'))
       return this.errorHandlerOutput ;
   }

   return { type: 'RestElement', loc: { start: startLoc, end: e.loc.end }, start: startc, end: e.end,argument: e };
};


