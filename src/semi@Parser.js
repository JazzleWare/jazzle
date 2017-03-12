this.semiLoc_soft = function () {
  switch (this.lttype) {
  case ';':
     var n = this.loc();
     this.next();
     return n;

  case 'eof':
     return this.nl ? null : this.loc();

  case '}':
     if ( !this.nl )
        return this.locOn(1);
  }
  
  return null;
};

this.semiI = function() {
  switch (this.lttype) {
  case ';':
    return this.c;
  case '}':
    return this.nl ? 0 : this.c0;
  case 'eof':
    return this.nl ? 0 : this.c;
  default:
    return 0;

  }
};
