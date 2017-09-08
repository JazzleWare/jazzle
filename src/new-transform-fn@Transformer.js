this.transformRawFn =
function(n, isVal) {
  var s = this.setScope(n['#scope'] );
  ASSERT.call(this, s.reached, 'not reached');
  var unreach = n.type === 'FunctionDeclaration';
  if (unreach) s.reached = false;

  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var ts = this.setTS([]);
  var th = this.thisState;

  this.cur.closureLLINOSA = this.cur.parent.scs.isAnyFn() ?
    createObj(this.cur.parent.scs.closureLLINOSA) : {};

  this.cur.synth_start(this.renamer);
  ASSERT.call(this, !this.cur.inBody, 'inBody');

  if (n.type === 'FunctionDeclaration')
    this.thisState &= ~THS_IS_REACHED;
  var argsPrologue = this.transformParams(n.params);
  if (argsPrologue) n.params = null;

  if (n.type === 'ArrowFunctionExpression')
    this.thisState = th;
  else
    this.thisState = THS_NONE;

  this.cur.activateBody();
  var fnBody = n.body.body;
  this.trList(fnBody, false);
  this.cur.deactivateBody();
  this.cur.synth_finish();

  if (unreach) {
    ASSERT.call(this, !s.reached, 'reached');
    s.reached = true;
  }
  this.setScope(s);

  this.setCVTZ(cvtz) ;
  this.setTS(ts);
  this.thisState = th;

  return this.synth_TransformedFn(n, argsPrologue);
};

this.transformDeclFn =
function(n) {
  var target = this.cur.findDeclOwn_m(_m(n.id.name));
  ASSERT.call(this, target, 'unresolved ('+name+')');
  n = this.transformRawFn(n, false);
  n.target = target;
  return n;
};

this.transformExprFn =
function(n) {
  n.id && this.synthFnExprName(n['#scope'].scopeName);
  n = this.transformRawFn(n, true);
  return n;
};

this.transformParams =
function(list) {
  if (this.cur.firstNonSimple)
    return this.transformParamsToArgumentsPrologue(list);

  var argd = null, argsmap = {}, e = list.length - 1;
  while (e >= 0) {
    var a = list[e];
    var mname = _m(a.name);
    if (HAS.call(argsmap, mname)) {
      if (argd === null) {
        var lg = this.cur.gocLG('argd');
        argd = lg.getL(0);
        if (argd === null) {
          argd = lg.newL();
          argd.name = '_';
          lg.seal();
        }
        argd.type |= DT_FNARG;
      }
      list[e] = this.synth_SynthName(argd );
    }
    else {
      a = this.toResolvedName(a, 'binding');
      argsmap[mname] = list[e] = a;
    }
    e--;
  }

  return null;
};

Transformers['FunctionDeclaration'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.cur.pushFun(n.id.name, this.transformDeclFn(n));

  return this.synth_Skip();
};

Transformers['ArrowFunctionExpression'] =
function(n, isVal) {
  if (n.expression) 
    n.body = this.e2b(n.body);
  return this.transformExprFn(n);
};

Transformers['FunctionExpression'] =
function(n, isVal) {
  return this.transformExprFn(n);
};

this.transformParamsToArgumentsPrologue =
function(list) {
  var a = null, t = null, e = 0;
  var prologue = [];
  while (e < list.length) {
    var left = list[e];
    if (left.type === 'RestElement') {
      left = left.argument;
      if (left.type === 'Identifier') {
        left = this.toResolvedName(left, 'binding');
        prologue.push(this.synth_ArgRest(left, e));
      }
      else {
        var t = this.allocTemp();
        prologue.push(this.synth_ArgRest(t, e));
        this.releaseTemp(t);
        a = this.synth_SynthAssig(left, t, true);
        a = this.tr(a, false);
        if (a)
          prologue.push(a);
      }
      ASSERT.call(this, e === list.length - 1, 'not last');
    }
    else {
      a = this.synth_SynthAssig(left, this.synth_ArgAt(e), true);
      a = this.tr(a, false)
      if (a)
        prologue.push(a);
    }
    e++;
  }

  return this.synth_AssigList(prologue);
};

this.synthFnExprName =
function(fnName) {
  ASSERT.call(this, fnName.synthName === "", 'synth');
  ASSERT.call(this, fnName.ref.scope.isExpr(), 'fn not an expr');
  var baseName = fnName.name, mname = "", synthName = this.rename(baseName, 0), num = 0;
  var rsList = fnName.ref.rsList;

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname);
      if (synth && synth !== fnName)
        continue RENAME;
    }

    break;
  } while (synthName = this.rename(baseName, num), true);

  fnName.synthName = synthName;
};

this.e2b =
function(ex) {
  return {
    type: 'BlockStatement',
    body: [{
      type: 'ReturnStatement',
      argument: ex,
      start: ex.start,
      end: ex.end,
      loc: ex.loc,
      '#c': {}, '#y': 0
    }],
    start: ex.start,
    end: ex.end,
    loc: ex.loc, '#c': {}, '#y': 0
  };
};
