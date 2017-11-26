  import {SA_BREAK, SA_CONTINUE} from '../other/scope-constants.js';
  import {TK_ID} from '../other/lexer-constants.js';
  import {CH_LPAREN, CTX_TOP, CH_RPAREN, CH_SEMI} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {cls} from './ctor.js';

cls.parseDoWhile =
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope; 

  this.allow(SA_BREAK|SA_CONTINUE);

  var c0 = this.c0, cb = {}, loc0 = this.loc0() ;

  this.suc(cb, 'bef');
  this.next(); // 'do...while'

  var nbody = this.parseStatement(true) ;
  if (this.lttype === TK_ID && this.ltval === 'while') {
    this.resvchk();
    this.spc(nbody, 'aft');
    this.next();
  }
  else
    this.err('do.has.no.while',{extra:[startc,startLoc,nbody]});

  this.suc(cb, 'while.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('do.has.no.opening.paren',{extra:[startc,startLoc,nbody]});

  var cond = core(this.parseExpr(CTX_TOP));
  var c = this.c, li = this.li, col = this.col;

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
    this.err('do.has.no.closing.paren',{extra:[startc,startLoc,nbody,cond]});

  if (this.lttype === CH_SEMI) {
     c = this.c;
     li = this.li ;
     col = this.col;
     this.suc(cb, 'cond.aft');
     this.next();
  }

  this.foundStatement = true;
  this.exitScope(); 

  return {
    type: 'DoWhileStatement',
    test: cond,
    start: c0,
    end: c,
    body: nbody,
    loc: {
      start: loc0,
      end: { line: li, column: col } },
    '#scope': scope,
    '#y': this.Y(cond)+this.Y(nbody), '#c': cb
  };
};


