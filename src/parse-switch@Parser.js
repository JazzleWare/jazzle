this.parseSwitchStatement = function () {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.fixupLabels(false) ;

  var startc = this.c0,
      startLoc = this.locBegin(),
      cases = [],
      hasDefault = false ,
      elem = null;

  this.next() ;
  if (!this.expectType_soft ('('))
    this.err('switch.has.no.opening.paren');

  var switchExpr = core(this.parseExpr(CTX_NONE|CTX_TOP));

  !this.expectType_soft (')') &&
  this.err('switch.has.no.closing.paren');

  !this.expectType_soft ('{') &&
  this.err('switch.has.no.opening.curly');

  this.enterScope(this.scope.blockScope()); 
  this.allow(SA_BREAK);

  while ( elem = this.parseSwitchCase()) {
    if (elem.test === null) {
       if (hasDefault ) this.err('switch.has.a.dup.default');
       hasDefault = true ;
    }
    cases.push(elem);
  }

  this.foundStatement = true;
  var scope = this.exitScope(); 

  var n = { type: 'SwitchStatement', cases: cases, start: startc, discriminant: switchExpr,
            end: this.c, loc: { start: startLoc, end: this.loc() }/*,scope:  scope  ,y:-1*/};
  if ( !this.expectType_soft ('}' ) &&
        this.err('switch.unfinished') )
    return this.errorHandlerOutput ;

  return n;
};


