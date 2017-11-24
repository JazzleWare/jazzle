
this.parseWith = 
function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  if (this.scope.insideStrict())
    this.err('with.strict')  ;

  this.fixupLabels(false);

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef');
  this.next(); // 'with'

  this.suc(cb, 'with.aft' );
  if (!this.expectT(CH_LPAREN))
    this.err('with.has.no.opening.paren');

  var obj = core(this.parseExpr(CTX_TOP));

  this.spc(obj, 'aft' );
  if (!this.expectT(CH_RPAREN))
    this.err('with.has.no.end.paren');

  var nbody = this.parseStatement(true);
  this.exitScope();

  this.foundStatement = true;
  return  {
    type: 'WithStatement',
    loc: { start: loc0, end: nbody.loc.end },
    start: c0,
    end: nbody.end,
    object: obj,
    body: nbody,
    '#scope': scope,
    '#y': this.Y(obj, nbody ), '#c': cb
  };
};

