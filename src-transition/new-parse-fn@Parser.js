this.parseFn =
function(ctx, st) {
  var labels_ = this.labels;
  var declMode_ = this.declMode;
  var isStmt = false;
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isMeth = st & (ST_CLSMEM|ST_OBJMEM);
  var isAsync = st & ST_ASYNC;

  var fnName = null;
  var declScope = null;
  if (!isMeth) {
    if (isStmt && isAsync) {
      this.unsatisfiedLabel &&
      this.err('async.label.not.allowed');

      this.scope.isBare() &&
      this.err('async.decl.not.allowed');
    }
    this.next(); // 'function'
    if (this.peekMul()) {
      this.v<=5 && this.err('ver.gen');
      if (isAsync)
        this.err('async.gen.not.supported.yet');
      if (isStmt) {
        this.unsatisfiedLabel &&
        this.err('gen.label.not.allowed');

        this.scope.isBare() &&
        this.err('gen.decl.not.allowed');
      }
      this.next(); // '*'
      st |= ST_GEN;
    }
    else {
      st |= ST_FN;
      if (this.scope.isBare()) {
        if (!this.scope.insideIf() ||
          this.scope.insideStrict())
          this.err('fun.decl.not.allowed');
        if (this.unsatisfiedLabel)
          this.fixupLabels(false);
      }
      else if (this.unsatisfiedLabel)
        this.scope.insideStrict() &&
        this.err('func.label.not.allowed');
    }

    if (isStmt) {
      if (this.lttype === TK_ID) {
        this.declMode = DT_FN;
        declScope = this.scope; 
        fnName = this.parsePattern();
      }
      else if (!(ctx & CTX_DEFAULT))
        this.err('fun.decl.has.got.no.actual.name');
    }
    else if (this.lttype === TK_ID)
      fnName = this.parseFnExprName(st);
  }

  this.enterScope(this.scope.spawnFn(st));
  if (fnName) {
    if (isStmt)
      this.scope.setName(
        fnName.name,
        st,
        declScope.findDecl_m(_m(fnName.name)));
    else
      this.scope,setName(
        fnName.name,
        st,
        null);
  }

  var argLen =
    !isMeth || !(st & ST_ACCESSOR) ?
      ARGLEN_ANY :
      (st & ST_GETTER) ?
        ARGLEN_GET :
        ARGLEN_SET;

  this.declMode = DT_FNARG;
  var argList = this.parseParams(argLen);

  this.scope.enterBody();

  this.labels = {};

  var nbody = this.parseFunBody();
  this.exitScope();

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression',
    id: fnName,
    start: c0,
    end: body.end,
    generator: (st & ST_GEN) !== 0,
    body: nbody,
    loc: { start: loc0, end: body.loc.end },
    params: argList,
    expression: false,
    async: (st & ST_ASYNC) !== 0,
    '#scope': scope
  };

  this.declMode = declMode_;
  this.labels = labels_;

  if (isStmt)
    this.foundStatement = true;

  return n;
};
