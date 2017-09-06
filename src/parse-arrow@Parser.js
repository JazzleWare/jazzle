this.parseArrow = function(arg, ctx)   {
  if (this.v <= 5)
    this.err('ver.arrow');
  var async = false;

  var cb = {};
  if (this.pt === ERR_ASYNC_NEWLINE_BEFORE_PAREN) {
    ASSERT.call(this, arg === this.pe,
      'how can an error core not be equal to the erroneous argument?!');
    this.err('arrow.newline.before.paren.async');
  }

  var sc = ST_ARROW;
  switch ( arg.type ) {
  case 'Identifier':
    this.scope.findRefAny_m(_m(arg.name)).d--;
    this.enterScope(this.scope.spawnFn(sc));
    this.scope.refDirect_m(_m(arg.name), null);
    this.asArrowFuncArg(arg);
    this.spc(arg, 'aft');
    break;

  case PAREN_NODE:
    this.enterScope(this.scope.spawnFn(sc));
    this.parenScope.makeParams(this.scope);
    this.parenScope = null;
    if (arg.expr) {
      if (arg.expr.type === 'SequenceExpression')
        this.asArrowFuncArgList(arg.expr.expressions);
      else
        this.asArrowFuncArg(arg.expr);
    }
    cb.bef = cmn(arg['#c'], 'bef' );
    cb.inner = cmn(arg['#c'], 'inner');
    this.suc(cb, 'list.bef' );
    break;

  case 'CallExpression':
    if (this.v >= 7 && arg.callee.type !== 'Identifier' || arg.callee.name !== 'async')
      this.err('not.a.valid.arg.list',{tn:arg});
    if (this.parenAsync !== null && arg.callee === this.parenAsync.expr)
      this.err('arrow.has.a.paren.async');

//  if (this.v < 7)
//    this.err('ver.async');

    async = true;
    sc |= ST_ASYNC;
    this.enterScope(this.scope.spawnFn(sc));
    this.parenScope.makeParams(this.scope);
    this.parenScope = null;
    this.asArrowFuncArgList(arg.arguments);
    cb.bef = arg.callee['#c'].bef;
    cb['async.aft'] = arg.callee['#c'].aft;
    cb.inner = arg['#c'].inner ;
    this.suc(cb, 'list.bef' );
    break;

  case INTERMEDIATE_ASYNC:
    async = true;
    sc |= ST_ASYNC;
    this.enterScope(this.scope.spawnFn(sc));
    this.scope.refDirect_m(_m(arg.id.name), null);
    this.asArrowFuncArg(arg.id);
    cb.bef = arg.asyncID['#c'].bef;
    this.spc(arg.id, 'aft');
    break;

  default: this.err('not.a.valid.arg.list');
  }

  this.pt_flush();

  var scope = this.scope;
  scope.activateBody();

  if (this.nl)
    this.err('arrow.newline');

  this.next();
  var isExpr = true, nbody = null;

  if (this.lttype === CH_LCURLY) {
    var prevLabels = this.labels,
        prevDeclMode = this.declMode;

    this.labels = {};
    isExpr = false;
    nbody = this.parseFunBody();

    this.labels = prevLabels;
    this.declMode = prevDeclMode;
  }
  else
    nbody = this.parseNonSeq(PREC_NONE, ctx|CTX_PAT) ;

  this.exitScope(); // body

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
    async: async,
    '#scope': scope, '#y': 0, '#c': cb
  }; 
};
