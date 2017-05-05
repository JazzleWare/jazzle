this.prseDbg = 
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, loc0 = this.loc0();
  var c = this.c, li = this.li, col = this.col;
  this.next() ;

  this.semi() || this.err('no.semi');

  this.foundStatement = true;
  return {
    type: 'DebuggerStatement',
    loc: { start: loc0, end: this.semiLoc || { line: li, column: col } } ,
    start: c0,
    end: this.semiC || c
  };
};
