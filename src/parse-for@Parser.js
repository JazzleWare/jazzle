this.parseFor = function() {
  if (!this.ensureStmt_soft())
    this.err('not.stmt');

  this.fixupLabels(true) ;

  var startc = this.c0,
      startLoc = this.locBegin();

  this.next () ;
  if (!this.expectType_soft ('('))
    this.err('for.with.no.opening.paren',{extra:[startc,startLoc]});

  this.enterScope(this.scope.bodyScope());
  this.scope.enterForInit();
  var head = null, headIsExpr = false;
  this.missingInit = false;

  if ( this.lttype === 'Identifier' ) {
    switch ( this.ltval ) {
    case 'var':
      this.canBeStatement = true;
      head = this.parseVariableDeclaration(CTX_FOR);
      break;

    case 'let':
      if ( this.v > 5 ) {
        this.canBeStatement = true;
        head = this.parseLet(CTX_FOR);
      }
      break;

    case 'const' :
      if (this.v < 5)
        this.err('for.const.not.in.v5',{extra:[startc,startLoc,scopeFlags]});

      this.canBeStatement = true;
      head = this. parseVariableDeclaration(CTX_FOR);
         break ;

    }
  }

  if (head === null) {
    headIsExpr = true;
    head = this.parseExpr( CTX_NULLABLE|CTX_PAT|CTX_FOR ) ;
  }
  else 
    this.foundStatement = false;

  this.scope.exitForInit();

  var nbody = null;
  var afterHead = null;

  if (head !== null && this.lttype === 'Identifier') {
    var kind = 'ForInStatement';
    switch ( this.ltval ) {
    case 'of':
       kind = 'ForOfStatement';
       this.ensureVarsAreNotResolvingToCatchParams();

    case 'in':
      if (this.ltval === 'in')
        this.resvchk();

      if (headIsExpr) {
        if (head.type === 'AssignmentExpression') { // TODO: not in the spec
          // TODO: squash with the `else if (head.init)` below
        //if (this.scope.insideStrict() || kind === 'ForOfStatement' || this.v < 7)
            this.err('for.in.has.init.assig',{tn:head,extra:[startc,startLoc,kind]});
        }
        this.adjustErrors()
        this.toAssig(head, CTX_FOR|CTX_PAT);
        this.currentExprIsAssig();
      }
      else if (head.declarations.length !== 1)
        this.err('for.decl.multi',{tn:head,extra:[startc,startLoc,kind]});
      else if (this.missingInit)
        this.missingInit = false;
      else if (head.declarations[0].init) {
        if (this.scope.insideStrict() || kind === 'ForOfStatement' ||
            this.v < 7 || head.declarations[0].id.type !== 'Identifier' || head.kind !== 'var')
          this.err('for.in.has.decl.init',{tn:head,extra:[startc,startLoc,kind]});
      }

      this.next();
      afterHead = kind === 'ForOfStatement' ? 
        this.parseNonSeqExpr(PREC_WITH_NO_OP, CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR) :
        this.parseExpr(CTX_NONE|CTX_TOP);

      if (!this.expectType_soft(')'))
        this.err('for.iter.no.end.paren',{extra:[head,startc,startLoc,afterHead,kind]});

      nbody = this.parseStatement(true);
      if (!nbody)
        this.err('null.stmt');

      this.foundStatement = true;
      this.exitScope();

      return {
        type: kind, loc: { start: startLoc, end: nbody.loc.end },
        start: startc, end: nbody.end,
        right: core(afterHead), left: head,
        body: nbody/* ,y:-1*/
      };

    default:
      this.err('for.iter.not.of.in',{extra:[startc,startLoc,head]});

    }
  }

  if (headIsExpr)
    this.currentExprIsSimple();
  else if (head && this.missingInit)
    this.err('for.decl.no.init',{extra:[startc,startLoc,head]});

  if (!this.expectType_soft (';'))
    this.err('for.simple.no.init.semi',{extra:[startc,startLoc,head]});

  afterHead = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (';'))
    this.err('for.simple.no.test.semi',{extra:[startc,startLoc,head,afterHead]});

  var tail = this.parseExpr(CTX_NULLABLE|CTX_PAT|CTX_NO_SIMPLE_ERR);
  if (!this.expectType_soft (')'))
    this.err('for.simple.no.end.paren',{extra:[startc,startLoc,head,afterHead,tail]});

  nbody = this.parseStatement(true);
  if (!nbody)
    this.err('null.stmt');
  this.foundStatement = true;
  this.exitScope();

  return {
    type: 'ForStatement', init: head && core(head), 
    start : startc, end: nbody.end,
    test: afterHead && core(afterHead),
    loc: { start: startLoc, end: nbody.loc.end },
    update: tail && core(tail), body: nbody/* ,y:-1*/
  };
};

// TODO: exsureVarsAreNotResolvingToCatchParams_soft
this.ensureVarsAreNotResolvingToCatchParams = function() {
  return;
// #if V
  var list = this.scope.nameList, e = 0;
  while (e < list.length) {
    if (list[e].type & DECL_MODE_CATCH_PARAMS)
      this.err('for.of.var.overrides.catch',{tn:this.idNames[list[e].id.name+'%']});
    e++;
  }
// #else
  for (var name in this.scope.definedNames) {
    if (this.scope.definedNames[name] & DECL_MODE_CATCH_PARAMS)
      this.err('for.of.var.overrides.catch',{tn:this.idNames[name]});
  }
// #end
};
