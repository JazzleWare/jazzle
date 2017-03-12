this.parseFunc = function(context, st) {
  var prevLabels = this.labels,
      prevDeclMode = this.declMode;

  var isStmt = false, startc = this.c0, startLoc = this.locBegin();
  if (this.canBeStatement) {
    isStmt = true;
    this.canBeStatement = false;
  }

  var isGen = false,
      isWhole = !(st & (ST_CLASSMEM|ST_OBJMEM));
   
  var argLen = !(st & ST_ACCESSOR) ? ARGLEN_ANY :
    (st & ST_SETTER) ? ARGLEN_SET : ARGLEN_GET;

  // current func name
  var cfn = null;

  if (isWhole) { 
    this.kw();
    this.next();
    if (this.lttype === 'op' && this.ltraw === '*') {
      if (this.v <= 5)
        this.err('ver.gen');
      if (st & ST_ASYNC)
        this.err('async.gen.not.yet.supported');
      if (this.unsatisfiedLabel)
        this.err('gen.label.not.allowed');
      if (!this.canDeclareFunctionsInScope(true))
        this.err('gen.decl.not.allowed');

      isGen = true;
      this.next();
    }

    if (isStmt) {
      if (!this.canDeclareFunctionsInScope(isGen))
        this.err('func.decl.not.allowed',{c0:startc,loc0:startLoc});
      if (this.unsatisfiedLabel) {
        if (!this.canLabelFunctionsInScope(isGen))
          this.err('func.label.not.allowed',{c0:startc,loc0:startLoc});
        this.fixupLabels(false);
      }
      if (this.lttype === 'Identifier') {
        this.declMode = DECL_MODE_FUNC_STMT;
        cfn = this.parsePattern();
      }
      else if (!(context & CTX_DEFAULT))
        this.err('func.decl.has.no.name');
    }
    else {
      // FunctionExpression's BindingIdentifier can be yield regardless of context;
      // but a GeneratorExpression's BindingIdentifier can't be 'yield'
      this.scopeFlags = isGen ?
        SCOPE_FLAG_ALLOW_YIELD_EXPR :
        SCOPE_FLAG_NONE;
      if (this.lttype === 'Identifier') {
        this.enterLexicalScope(false);
        this.scope.synth = true;
        this.declMode = DECL_MODE_FUNC_EXPR;
        cfn = this.parsePattern();
      }
    }
  }
  else if (flags & MEM_GEN)
    isGen = true;

  this.enterFuncScope(isStmt); 
  this.declMode = DECL_MODE_FUNC_PARAMS;

  this.scopeFlags = SCOPE_FLAG_NONE;

  if (isGen)
    this.scopeFlags |= SCOPE_FLAG_ALLOW_YIELD_EXPR;

  if (flags & MEM_SUPER)
    this.scopeFlags |= (flags & (MEM_SUPER|MEM_CONSTRUCTOR));

  // TODO: super is allowed in methods of a class regardless of whether the class
  // has an actual heritage clause; but this could probably be implemented better
  else if (!isWhole && !(flags & MEM_CONSTRUCTOR))
    this.scopeFlags |= SCOPE_FLAG_ALLOW_SUPER;
 
  if (flags & MEM_ASYNC) {
    this.scopeFlags |= SCOPE_FLAG_ALLOW_AWAIT_EXPR;
  }

  // class members, along with obj-methods, have strict formal parameter lists,
  // which is a rather misleading name for a parameter list in which dupes are not allowed
  if (!this.tight && !isWhole)
    this.enterComplex();

  this.firstNonSimpArg = null;

  this.scopeFlags |= SCOPE_FLAG_ARG_LIST;
  var argList = this.parseArgs(argLen);
  this.scopeFlags &= ~SCOPE_FLAG_ARG_LIST;

  this.scopeFlags |= SCOPE_FLAG_FN;  

  this.labels = {};

  var nbody = this.parseFuncBody(context & CTX_FOR);

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression', id: cfn,
    start: startc, end: nbody.end, generator: isGen,
    body: nbody, loc: { start: startLoc, end: nbody.loc.end },
    expression: nbody.type !== 'BlockStatement', params: argList,

    // TODO: this should go in parseAsync
    async: (flags & MEM_ASYNC) !== 0
  };

  if (isStmt)
    this.foundStatement = true;

  this.labels = prevLabels;
  this.tight = prevStrict;
  this.scopeFlags = prevScopeFlags;
  this.declMode = prevDeclMode;
  this.firstNonSimpArg = prevNonSimpArg;
  
  this.exitScope();
  return n;
};
 
