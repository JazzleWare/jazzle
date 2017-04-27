this. parseArrayPattern = function() {
  if (this.v <= 5)
    this.err('ver.patarr');

  var startc = this.c - 1,
      startLoc = this.locOn(1),
      elem = null,
      list = [];

  if (this.scope.isAnyFnHead())
    this.scope.enterUniqueArgs();

  this.next();
  while ( true ) {
      elem = this.parsePattern();
      if ( elem ) {
         if ( this.lttype === 'op' && this.ltraw === '=' )
           elem = this.parseAssig(elem);
      }
      else {
         if ( this.lttype === '...' ) {
           list.push(this.parseRestElement());
           break ;
         }  
      }
    
      if ( this.lttype === ',' ) {
         list.push(elem);
         this.next();
      }       
      else  {
         if ( elem ) list.push(elem);
         break ;
      }
  } 

  elem = { type: 'ArrayPattern', loc: { start: startLoc, end: this.loc() },
           start: startc, end: this.c, elements : list/* ,y:-1*/};

  if ( !this. expectType_soft ( ']' ) &&
        this.err('pat.array.is.unfinished') )
    return this.errorHandlerOutput ;

  return elem;
};


