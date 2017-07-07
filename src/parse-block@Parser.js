this.parseBlock = function () {
  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBlock()); 
  var scope = this.scope;

  var c0 = this.c0, loc0 = this.loc0();

  var cb = {}; this.suc(cb, 'bef' );
  this.next(); // '{'

  var n = {
    type: 'BlockStatement',
    body: this.stmtList(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0, 
      end: this.loc() }, 
    '#scope': scope, 
    '#y': this.yc, '#c': cb
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('block.unfinished');

  this.exitScope(); 

  return n;
};