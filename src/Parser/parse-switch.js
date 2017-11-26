  import {CH_LPAREN, CTX_TOP, CH_RPAREN, CH_LCURLY, CH_RCURLY} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {SA_BREAK} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.parseSwitch = function () {
  this.resvchk();
  !this.testStmt() && this.err('not.stmt');
  this.fixupLabels(false) ;

  var c0 = this.c0, loc0 = this.loc0(),
      cases = [], hasDefault = false , elem = null;

  var cb = {}; this.suc(cb, 'bef');
  this.next(); // 'switch'
  this.suc(cb, 'switch.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('switch.has.no.opening.paren');

  var switchExpr = core(this.parseExpr(CTX_TOP));
  this.spc(switchExpr, 'aft');

  if (!this.expectT(CH_RPAREN))
    this.err('switch.has.no.closing.paren');

  this.suc(cb, 'cases.bef');
  if (!this.expectT(CH_LCURLY))
    this.err('switch.has.no.opening.curly');

  this.enterScope(this.scope.spawnBlock()); 
  var scope = this.scope;

  this.allow(SA_BREAK);

  var y = 0;
  while (elem = this.parseSwitchCase()) {
    if (elem.test === null) {
       if (hasDefault ) this.err('switch.has.a.dup.default');
       hasDefault = true ;
    }
    cases.push(elem);
    y += this.Y(elem);
  }

  this.foundStatement = true;
  this.exitScope(); 

  var n = {
    type: 'SwitchStatement',
    cases: cases,
    start: c0,
    discriminant: switchExpr,
    end: this.c,
    loc: {
      start: loc0,
      end: this.loc() }, 
    '#scope': scope,
    '#y': this.Y(switchExpr)+(y), '#c': cb
  };

  this.suc(cb, 'inner');
  if (!this.expectT(CH_RCURLY))
    this.err('switch.unfinished');

  return n;
};


