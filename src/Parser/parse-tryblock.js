  import {TK_ID} from '../other/lexer-constants.js';
  import {cls} from './cls.js';

this.parseTryStatement = function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(false);

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'try'

  this.enterScope(this.scope.spawnBlock()); 

  var tryBlock = this.parseDependent('try');
  tryBlock['#scope'] = this.scope;
  var tryScope = this.scope; 

  this.exitScope(); 

  var finBlock = null, catBlock  = null;
  if (this.lttype === TK_ID && this.ltval === 'catch')
    catBlock = this.parseCatchClause();

  var finScope = null;
  if (this.lttype === TK_ID && this.ltval === 'finally') {
    this.resvchk();
    this.suc(cb, 'finally.bef') ;
    this.next();
    this.enterScope(this.scope.spawnBlock()); 
    finScope = this.scope;
    finBlock = this.parseDependent('finally');
    finBlock['#scope'] = this.scope;
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
    '#y': this.Y(tryBlock)+this.Y0(catBlock,finBlock),
    '#finScope': finScope,
    '#c': cb,
    '#tryScope': tryScope,

  };
};

