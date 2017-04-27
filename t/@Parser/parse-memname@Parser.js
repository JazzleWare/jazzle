this .memberID = function() { return this.v > 5 ? this.id() : this.validateID("") ; };
this .memberExpr = function() {
  if (this.v <= 5)
    this.err('ver.mem.comp');

  var startc = this.c - 1,
      startLoc = this.locOn(1);
  this.next() ;
  
  // none of the modifications memberExpr may make to this.pt, this.at, and this.st
  // overwrite some other unrecorded this.pt, this.at, or this.st -- an unrecorded value of <pt:at:st>
  // means a whole elem was just parsed, and <pt:at:st> is immediately recorded after that whole
  // potpat element is parsed, so if a memberExpr overwrites <pt:at:st>, that <pt:at:st> is not an
  // unrecorded one.
  
  // TODO: it is not necessary to reset <pt:at>
  this.pt = this.at = this.st = 0;
  var e = this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR); // TODO: should be CTX_NULLABLE, or else the next line is in vain 
  if (!e && this.err('prop.dyna.no.expr') ) // 
    return this.errorHandlerOutput ;

  var n = { type: PAREN, expr: e, start: startc, end: this.c, loc: { start: startLoc, end: this.loc() } } ;
  if ( !this.expectType_soft (']') &&
        this.err('prop.dyna.is.unfinished') )
    return this.errorHandlerOutput ;
 
  return n;
};


