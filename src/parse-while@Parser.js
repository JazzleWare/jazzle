this.parseWhile = 
function () {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope; 
  this.allow(SA_BREAK|SA_CONTINUE);
  this.scope.flags |= SF_LOOP;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'while'

  this.suc(cb, 'while.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('while.has.no.opening.paren');
 
  var cond = core(this.parseExpr(CTX_TOP));

  this.spc(cond, 'aft');
  if (!this.expectT(CH_RPAREN))
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
    '#y': this.Y(cond, nbody), '#c': cb
  };
};
