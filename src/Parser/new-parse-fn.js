  import {ST_CLSMEM, ST_OBJMEM, ST_ASYNC, ST_GEN, ST_DECL, DT_FN, ST_EXPR, DT_FNNAME, ST_ACCESSOR, ST_GETTER, DT_FNARG} from '../other/scope-constants.js';
  import {TK_ID} from '../other/lexer-constants.js';
  import {CTX_DEFAULT, ARGLEN_ANY, ARGLEN_GET, ARGLEN_SET} from '../other/constants.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './cls.js';

cls.parseFn =
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

  var c0 = this.c0, cb = {}, loc0 = this.loc0();
  this.suc(cb, 'bef');

  var argploc = null;
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

      this.suc(cb, 'fun.aft');
      this.next(); // '*'
      st |= ST_GEN;
    }
    if (isStmt) {
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

      st |= ST_DECL;
      if (this.lttype === TK_ID) {
        this.declMode = DT_FN|this.cutEx();
        declScope = this.scope; 
        fnName = this.parsePat();
      }
      else if (!(ctx & CTX_DEFAULT))
        this.err('fun.decl.has.got.no.actual.name');
    }
    else {
      st |= ST_EXPR ;
      if (this.lttype === TK_ID)
        fnName = this.getName_fn(st);
    }
  }

  this.enterScope(this.scope.spawnFn(st));
  if (fnName) {
    if (isStmt)
      this.scope.setName(
        fnName.name,
        declScope.findDeclOwn_m(_m(fnName.name))
      ).t(DT_FNNAME).s(fnName);
    else
      this.scope.setName(fnName.name, null).t(DT_FNNAME).s(fnName);
  }

  var argLen =
    !isMeth || !(st & ST_ACCESSOR) ?
      ARGLEN_ANY :
      (st & ST_GETTER) ?
        ARGLEN_GET :
        ARGLEN_SET;

  this.declMode = DT_FNARG;

  this.suc(cb, 'list.bef' );
  var argList = this.parseParams(argLen);
  argploc = this.argploc; this.argploc = null;
  cb.inner = this.cb;

  this.scope.activateBody();

  this.labels = {};

  var nbody = this.parseFunBody();
  var scope = this.exitScope();

  var n = {
    type: isStmt ? 'FunctionDeclaration' : 'FunctionExpression',
    id: fnName,
    start: c0,
    end: nbody.end,
    generator: (st & ST_GEN) !== 0,
    body: nbody,
    loc: { start: loc0, end: nbody.loc.end },
    params: argList,
    expression: false,
    async: (st & ST_ASYNC) !== 0,
    '#scope': scope, '#y': 0, '#c': cb , 
    '#argploc': argploc
  };

  this.declMode = declMode_;
  this.labels = labels_;

  if (isStmt)
    this.foundStatement = true;

  return n;
};


