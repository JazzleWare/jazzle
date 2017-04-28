this.parseBlock = function () {
  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBlock()); 
  var scope = this.scope;

  var c0 = this.c0, loc0 = this.loc0();
  this.next(); // '{'

  var n = {
    type: 'BlockStatement',
    body: this.blck(),
    start: c0,
    end: this.c,
    loc: {
      start: loc0, 
      end: this.loc() }, 
    '#scope': scope, 
    '#y': -1
  };

  if (this.expectTT(CH_RCURLY))
    this.err('block.unfinished');

  this.exitScope(); 

  return n;
};
