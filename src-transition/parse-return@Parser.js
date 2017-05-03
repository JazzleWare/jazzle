this.parseReturn = function () {
  this.resvchk();
  !this.ensureSAT() && this.err('not.stmt');
  this.fixupLabels(false ) ;

  if (!this.scope.canReturn()) 
    this.err('return.not.in.a.function');

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col, r = null;

  this.next(); // 'return'

  if (!this.nl)
    r = this.parseExpr(CTX_TOP);

  !this.semi() && this.err('no.semi');
  var ec = this.semiC || (r && r.end) || c;
  var eloc = this.semiLoc ||
    (r && r.loc.end) ||
    { line: li, column: col };

  this.foundStatement = true;
  return { 
    type: 'ReturnStatement',
    argument: r,
    start: startc,
    end: ec,
    loc: {
      start: loc0,
      end: eloc 
    } 
  };
};
