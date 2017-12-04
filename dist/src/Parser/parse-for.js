  import {CH_LPAREN, CTX_NONE, CTX_FOR, CTX_NULLABLE, CTX_PAT, CTX_TOP, CH_RPAREN, CH_SEMI} from '../other/constants.js';
  import {TK_ID, PREC_NONE} from '../other/lexer-constants.js';
  import {DT_LET, DT_VAR, DT_CONST, SA_CONTINUE, SA_BREAK, SF_LOOP} from '../other/scope-constants.js';
  import {core} from '../other/util.js';
  import {cls} from './cls.js';

cls.parseFor = function() {
  this.resvchk();
  this.testStmt() || this.err('not.stmt');
  this.fixupLabels(true) ;

  var c0 = this.c0, cb = {}, loc0 = this.loc0();

  this.suc(cb, 'bef' );
  this.next () ;

  this.suc(cb, 'for.aft');
  if (!this.expectT(CH_LPAREN))
    this.err('for.with.no.opening.paren',{extra:[c0,loc0]});

  this.enterScope(this.scope.spawnBare());
  var scope = this.scope;
  var head = null, headIsExpr = false, headctx = CTX_NONE;
  this.missingInit = false;

  this.scope.enterForInit();
  if (this.lttype === TK_ID)
  switch ( this.ltval ) {
  case 'let':
    if (this.v<5)
      break;
    this.canBeStatement = true;
    head = this.parseVar(DT_LET, CTX_FOR);
    if (!this.foundStatement) { // i.e., we got a letID
      this.canBeStatement = false; // because parseVar actually keeps it intact, even in the event of a handleLet call
      this.exprHead = head;
      head = null;
    }
    break;

  case 'var':
    this.canBeStatement = true;
    head = this.parseVar(DT_VAR, CTX_FOR);
    break;

  case 'const':
    this.canBeStatement = true;
    head = this.parseVar(DT_CONST, CTX_FOR);
    break;
  }

  if (this.foundStatement) // head is a decl
    this.foundStatement = false;
  else {
    headIsExpr = true;
    head = this.parseExpr(headctx = CTX_NULLABLE|CTX_PAT|CTX_FOR);
  }
  this.scope.exitForInit();

  var nbody = null;
  var afterHead = null;

  // TODO: core(head)
  if (head !== null && this.lttype === TK_ID) {
    var kind = 'ForInStatement', iterkw = this.ltval;
    if (iterkw === 'of') {
      kind = 'ForOfStatement';
      this.ensureVarsAreNotResolvingToCatchParams();
    }
    else if (iterkw === 'in')
      this.resvchk();
    else 
      this.err('for.iter.not.of.in',{extra:[startc,startLoc,head]});

    if (headIsExpr) {
      if (head.type === 'AssignmentExpression')
        this.err('for.in.has.init.assig',{tn:head,extra:[startc,startLoc,kind]});
      this.st_adjust_for_toAssig();
      this.toAssig(head, headctx);
      this.st_flush();
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

    this.spc(core(head), 'aft');
    this.next();
    afterHead = kind === 'ForOfStatement' ? 
      this.parseNonSeq(PREC_NONE, CTX_TOP) :
      this.parseExpr(CTX_TOP);

    this.spc(core(afterHead), 'aft');
    if (!this.expectT(CH_RPAREN))
      this.err('for.iter.no.end.paren',{extra:[head,startc,startLoc,afterHead,kind]});

    this.scope.actions |= (SA_CONTINUE|SA_BREAK);
    this.scope.flags |= SF_LOOP;
    nbody = this.parseStatement(true);
    if (!nbody)
      this.err('null.stmt');

    this.foundStatement = true;
    this.exitScope();

    return {
      type: kind,
      loc: { start: loc0, end: nbody.loc.end },
      start: c0,
      end: nbody.end,
      body: nbody, 
      left: head,
      right: core(afterHead),
      '#y': this.Y(head,afterHead,nbody),
      '#scope': scope,
      '#c': cb
    };
  }

  if (headIsExpr)
    this.st_flush();
  else if (head && this.missingInit)
    this.err('for.decl.no.init',{extra:[startc,startLoc,head]});

  head ? this.spc(core(head), 'aft') : this.suc(cb, 'head');
  if (!this.expectT(CH_SEMI))
    this.err('for.simple.no.init.semi',{extra:[startc,startLoc,head]});

  afterHead = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  afterHead ? this.spc(core(afterHead), 'aft') : this.suc(cb, 'test');
  if (!this.expectT(CH_SEMI))
    this.err('for.simple.no.test.semi',{extra:[startc,startLoc,head,afterHead]});

  var tail = this.parseExpr(CTX_NULLABLE|CTX_TOP);
  tail ? this.spc(core(tail), 'aft') : this.suc(cb, 'tail');
  if (!this.expectT(CH_RPAREN))
    this.err('for.simple.no.end.paren',{extra:[startc,startLoc,head,afterHead,tail]});

  this.scope.actions |= (SA_CONTINUE|SA_BREAK);
  this.scope.flags |= SF_LOOP;

  nbody = this.parseStatement(true);
  if (!nbody)
    this.err('null.stmt');
  this.foundStatement = true;
  this.exitScope();

  return {
    type: 'ForStatement',
    init: head && core(head), 
    start : c0,
    end: nbody.end,
    test: afterHead && core(afterHead),
    loc: { start: loc0, end: nbody.loc.end },
    body: nbody,
    update: tail && core(tail),
    '#scope': scope,
    '#c': cb,
    '#y': this.Y0(head,afterHead,tail)+this.Y(nbody)
  };
};

cls.ensureVarsAreNotResolvingToCatchParams = function() {
  return;
};


