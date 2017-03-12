this.parseArrowFunctionExpression = function(arg, context)   {
  if (this.v <= 5)
    this.err('ver.arrow');
  var tight = this.scope.insideStrict(), async = false;

  if (this.pt === ERR_ASYNC_NEWLINE_BEFORE_PAREN) {
    ASSERT.call(this, arg === this.pe,
      'how can an error core not be equal to the erroneous argument?!');
    this.err('arrow.newline.before.paren.async');
  }

  var st = ST_ARROW;
  switch ( arg.type ) {
  case 'Identifier':
    var decl = this.scope.findDecl(arg.name);
    if (decl) this.ref.direct.ex--;
    else this.scope.findRef(arg.name).direct.fw--;

    this.enterScope(this.scope.fnHeadScope(st));
    this.asArrowFuncArg(arg);
    this.scope.declare(arg.name, DM_FNARG);
    break;

  case PAREN_NODE:
    this.enterScope(this.scope.fnHeadScope(st));
    this.scope.absorb(this.parenScope);
    this.parenScope = null;
    if (arg.expr) {
      if (arg.expr.type === 'SequenceExpression')
        this.asArrowFuncArgList(arg.expr.expressions);
      else
        this.asArrowFuncArg(arg.expr);
    }
    break;

  case 'CallExpression':
    if (this.v >= 7 && arg.callee.type !== 'Identifier' || arg.callee.name !== 'async')
      this.err('not.a.valid.arg.list',{tn:arg});
    if (this.parenAsync !== null && arg.callee === this.parenAsync.expr)
      this.err('arrow.has.a.paren.async');

//  if (this.v < 7)
//    this.err('ver.async');

    async = true;
    st |= ST_ASYNC;
    this.enterScope(this.scope.fnHeadScope(st));
    this.scope.absorb(this.parenScope);
    this.parenScope = null;
    this.asArrowFuncArgList(arg.arguments);
    break;

  case INTERMEDIATE_ASYNC:
    async = true;
    st |= ST_ASYNC;
    this.enterScope(this.scope.fnHeadScope(st));
    this.asArrowFuncArg(arg.id);
    this.scope.declare(arg.name, DM_FNARG);
    break;

  default:
    this.err('not.a.valid.arg.list');

  }

  var funcHead = this.exitScope();
  this.currentExprIsParams();

  this.enterScope(this.scope.fnBodyScope(st));
  this.scope.funcHead = funcHead;

  if (this.nl)
    this.err('arrow.newline');

  this.next();

  var isExpr = true, nbody = null;

  if ( this.lttype === '{' ) {
    var prevLabels = this.labels, prevDeclMode = this.declMode;
    this.labels = {};
    isExpr = false;
    nbody = this.parseFuncBody(CTX_NONE|CTX_PAT|CTX_NO_SIMPLE_ERR);
    this.labels = prevLabels; this.declMode = prevDeclMode;
  }
  else
    nbody = this. parseNonSeqExpr(PREC_WITH_NO_OP, context|CTX_PAT) ;

  this.exitScope();

  var params = core(arg);
  if (params === null)
    params = [];
  else if (params.type === 'SequenceExpression')
    params = params.expressions;
  else if (params.type === 'CallExpression')
    params = params.arguments;
  else {
    if (params.type === INTERMEDIATE_ASYNC)
      params = params.id;
    params = [params];
  }

  return {
    type: 'ArrowFunctionExpression', params: params, 
    start: arg.start, end: nbody.end,
    loc: {
      start: arg.loc.start,
      end: nbody.loc.end
    },
    generator: false, expression: isExpr,
    body: core(nbody), id : null,
    async: async
  }; 
};

