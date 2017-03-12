this.parseIfStatement = function () {
  if ( !this.ensureStmt_soft () && this.err('not.stmt') )
    return this.errorHandlerOutput;

  this.fixupLabels(false);
  this.enterScope(this.scope.bodyScope());
  this.scope.mode |= SM_INSIDE_IF;

  var startc = this.c0,
      startLoc  = this.locBegin();
  this.next () ;
  !this.expectType_soft('(') &&
  this.err('if.has.no.opening.paren');

  var cond = core(this.parseExpr(CTX_NONE|CTX_TOP));

  !this.expectType_soft (')') &&
  this.err('if.has.no.closing.paren');

  var nbody = this. parseStatement (false);
  var scope = this.exitScope(); 

  var alt = null;
  if ( this.lttype === 'Identifier' && this.ltval === 'else') {
     this.kw(), this.next() ;
     this.enterScope(this.scope.bodyScope());
     alt = this.parseStatement(false);
     this.exitScope();
  }

  this.foundStatement = true;
  return { type: 'IfStatement', test: cond, start: startc, end: (alt||nbody).end,
     loc: { start: startLoc, end: (alt||nbody).loc.end }, consequent: nbody, alternate: alt/*,scope:  scope  ,y:-1*/};
};
