this.parseFunc = function(context, st) {
  var prevLabels = this.labels,
      prevDeclMode = this.declMode; 

  var isStmt = false,
      startc = this.c0,
      startLoc = this.locBegin();

  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isGen = false,
      isMeth = st & (ST_CLSMEM|ST_OBJMEM);

  var fnName = null,
      argLen = !(st & ST_ACCESSOR) ? ARGLEN_ANY :
        (st & ST_SETTER) ? ARGLEN_SET : ARGLEN_GET;

  // it is not a meth -- so the next token is `function`
  if (!isMeth) {
    this.next();
    st |= isStmt ? ST_DECL : ST_EXPR;
    if (this.lttype === 'op' && this.ltraw === '*') {
      if (this.v <= 5)
        this.err('ver.gen');
      if (isStmt) {
        if (st & ST_ASYNC)
          this.err('async.gen.not.yet.supported');
        if (this.unsatisfiedlLabel)
          this.err('gen.label.notAllowed');
        if (this.scope.isBody())
          this.err('gen.decl.not.allowed');
      }
      isGen = true;
      st |= ST_GEN;
      this.next();
    }
    else {
      st |= ST_FN;
      if (isStmt) {
        var isAsync = st & ST_ASYNC;
        if (this.scope.isBare()) {
          if (isAsync)
            this.err('async.decl.not.allowed');
          if (!this.scope.insideIf() || this.scope.insideStrict())
            this.err('func.decl.not.allowed');
          if (this.unsatisfiedLabel)
            this.fixupLabels(false);
        }

        if (this.unsatisfiedLabel) {
          if (this.scope.insideStrict() | (st & (ST_ASYNC|ST_GEN)))
            this.err('func.label.not.allowed');
        }
      }
    }

    if (isStmt) {
      if (this.lttype === 'Identifier') {
        this.declMode = DM_FUNCTION;
        fnName = this.parsePattern();

      } else if (!(context & CTX_DEFAULT)) {
        this.err('func.decl.has.no.name');
      }
      // get the name and enter the scope
    }
    else {
      // enter the scope and get the name
      if (this.lttype === 'Identifier') {
        var temp = 0;
        if (st & ST_GEN) {
          temp = this.scop.mode;
          this.scope.mode |= SM_YIELD_KW;
          fnName = this.parseFuncExprName();
          this.scope.mode = temp;
        }
        else {
          temp = this.scope.allowed;
          this.scope.allowed &= ~SA_YIELD;
          fnName = this.parseFuncExprName();
          this.scope.allowed = temp;
        }
      }
    }
  }

  this.enterScope(this.scope.fnHeadScope(st));
  if (fnName && this.scope.isExpr())
    this.scope.setName(fnName);

  this.declMode = DM_FNARG;
  var argList = this.parseArgs(argLen);
  var fnHeadScope = this.exitScope();

  this.labels = {};

  this.enterScope(this.scope.fnBodyScope(st));
  this.scope.funcHead = fnHeadScope;
  var body = this.parseFuncBody(context & CTX_FOR);
  this.exitScope();

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression',
    id: fnName,
    start: startc,
    end: body.end,
    generator: (st & ST_GEN) !== 0,
    body: body,
    loc: { start: startLoc, end: body.loc.end },
    expression: body.type !== 'BlockStatement', params: argList,
    async: (st & ST_ASYNC) !== 0
  };

  if (isStmt)
    this.foundStatement = true;

  this.labels = prevLabels;
  this.declMode = prevDeclMode;

  return n;
};

this.parseFuncExprName = function() {
  var name = this.validateID("");
  if (this.scope.insideStrict() && arguments_or_eval(fnName.name))
    this.err('bind.eval.or.arguments');
  return name;
};
