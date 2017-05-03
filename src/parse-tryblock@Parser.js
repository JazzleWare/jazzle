this.parseTryStatement = function () {
  this.resvchk();
  this.ensureSAT() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, loc0 = this.loc0();

  this.next(); // 'try'

  this.enterScope(this.scope.spawnBlock()); 

  var tryBlock = this.parseDependent('try');
  var tryScope = this.scope; 

  this.exitScope(); 

  var finBlock = null, catBlock  = null;
  if (this.lttype === TK_ID && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  var finScope = null;
  if (this.lttype === TK_ID && this.ltval === 'finally') {
    this.resvchk();
    this.next();
    this.enterScope(this.scope.spawnBare()); 
    finScope = this.scope;
    finBlock = this.parseDependent('finally');
    this.exitScope(); 
  }

  var finOrCat = finBlock || catBlock;

  finOrCat || this.err('try.has.no.tail');
  this.foundStatement = true;

  return  {
    type: 'TryStatement',
    block: tryBlock,
    start: c0,
    end: finOrCat.end,
    handler: catBlock,
    finalizer: finBlock,
    loc: {
      start: loc0,
      end: finOrCat.loc.end },
    '#tryScope': tryScope,
    '#finScope': finScope,
    '#y': -1
  };
};
