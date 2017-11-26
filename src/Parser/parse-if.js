  import {SF_INSIDEIF} from '../other/scope-constants.js';
  import {CH_LPAREN, CTX_TOP, CH_RPAREN} from '../other/constants.js';
  import {core} from '../other/util.js';
  import {TK_ID} from '../other/lexer-constants.js';
  import {cls} from './ctor.js';

cls.parseIf = function () {
  this.resvchk();
  !this.testStmt() && this.err('not.stmt');
  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBare());
  var ifScope = this.scope; 
  this.scope.flags |= SF_INSIDEIF;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'if'

  this.suc(cb, 'aft.if');
  if (!this.expectT(CH_LPAREN))
    this.err('if.has.no.opening.paren');

  var cond = core(this.parseExpr(CTX_TOP));

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
    this.err('if.has.no.closing.paren');

  var nbody = this.parseStatement(false);
  this.exitScope(); 

  var alt = null, elseScope = null;
  if (this.lttype === TK_ID && this.ltval === 'else') {
    this.resvchk();
    this.spc(nbody, 'aft');
    this.next(); // 'else'
    this.enterScope(this.scope.spawnBare());
    elseScope = this.scope; 
    alt = this.parseStatement(false);
    this.exitScope();
  }

  this.foundStatement = true;
  return {
    type: 'IfStatement',
    test: cond,
    start: c0,
    end: (alt||nbody).end,
    loc: {
      start: loc0,
      end: (alt||nbody).loc.end },
    consequent: nbody,
    alternate: alt,
    '#ifScope': ifScope,
    '#y': this.Y(cond,nbody)+this.Y0(alt),
    '#c': cb,
    '#elseScope': elseScope
  };
};


