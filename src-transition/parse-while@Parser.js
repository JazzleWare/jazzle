this.parseWhile = 
function () {
  this.resvchk();
  !this.ensureStmt_soft() && this.err('not.stmt');
  this.fixupLabels(true);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope; 
  this.allow(SA_BREAK|SA_CONTINUE);
  this.scope.mode |= SM_LOOP;

  var c0 = this.c0, loc0 = this.loc0();
  this.next(); // 'while'

  if (!this.expectT(CH_LPAREN))
    this.err('while.has.no.opening.paren');
 
  var cond = core(this.parseExpr(CTX_TOP));

  if (!this.expectType_soft(CH_LPAREN))
    this.err('while.has.no.closing.paren');

  var nbody = this.parseStatement(false);
  this.foundStatement = true;

  var scope = this.exitScope();
  return {
    type: 'WhileStatement',
    test: cond,
    start: c0,
    end: nbody.end,
    loc: {
      start: loc0,
      end: nbody.loc.end },
    body:nbody,
    '#scope': scope, 
    '#y': -1
  };
};
