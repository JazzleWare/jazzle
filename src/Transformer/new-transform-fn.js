  import {ASSERT, THS_NEEDS_CHK, THS_NONE, THS_IS_REACHED, HAS, ASSERT_EQ} from '../other/constants.js';
  import {createObj, tg} from '../other/util.js';
  import {_m} from '../other/scope-util.js';
  import {DT_FNARG} from '../other/scope-constants.js';
  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

cls.transformRawFn =
function(n, isVal) {
  var s = n['#scope'];
  s = this.setScope(s);
  ASSERT.call(this, s.reached, 'not reached');
  var unreach = n.type === 'FunctionDeclaration';
  if (unreach) s.reached = false;

  var cvtz = this.setCVTZ(createObj(this.cvtz));
  var ts = this.setTS([]);
  var th = this.thisState, lg = null, l = null;

  if (this.cur.isCtor() && this.cur.parent.hasHeritage()) {
    lg = this.cur.gocLG('ti');
    l = lg.getL(0);
    if (l===null) { l = lg.newL(); lg.seal(); l.name = 'ti'; }
  }

  this.cur.closureLLINOSA = this.cur.parent.scs.isAnyFn() ?
    createObj(this.cur.parent.scs.closureLLINOSA) : {};

  this.cur.synth_start(this.renamer);
  ASSERT.call(this, !this.cur.inBody, 'inBody');

  if (n.type === 'FunctionDeclaration') {
    var out = s.scs;
    this.thisState = out.isCtor() && out.parent.hasHeritage() ? THS_NEEDS_CHK : THS_NONE;
  }

  var argsPrologue = this.transformParams(n.params);
  if (argsPrologue) n.params = null;

  if (n.type === 'ArrowFunctionExpression')
    this.thisState = th;
  else
    this.thisState = this.cur.isCtor() && this.cur.parent.hasHeritage() ?
      THS_NEEDS_CHK : THS_NONE;

  this.cur.activateBody();
  var fnBody = n.body.body;
  this.trList(fnBody, false);

  if (l && !(this.thisState & THS_IS_REACHED) && (this.thisState & THS_NEEDS_CHK)) {
    var len = fnBody.length;
    if (len === 0 || fnBody[len-1].type !== 'ReturnStatement') {
      l.track(this.cur);
      fnBody.push(this.synth_RCheck(null, l));
    }
  }

  this.cur.deactivateBody();
  this.cur.synth_finish();

  if (unreach) {
    ASSERT.call(this, !s.reached, 'reached');
    s.reached = true;
  }

  this.setScope(s);
  this.setTS(ts);

  this.setCVTZ(cvtz) ;
  this.thisState = th;

  return this.synth_TransformedFn(n, argsPrologue);
};

cls.transformDeclFn =
function(n) {
  var target = tg(n.id);
  ASSERT.call(this, target, 'unresolved ('+n.id.name+')');
  n = this.transformRawFn(n, false);
  n.target = target;
  return n;
};

cls.transformExprFn =
function(n) {
  var sn = n['#scope'].scopeName;
  if (sn) sn.isInsignificant() || this.synthFnExprName(sn);
  n = this.transformRawFn(n, true);
  return n;
};

cls.transformParams =
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

cls.transformParamsToArgumentsPrologue =
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

cls.synthFnExprName =
function(fnName) {
  ASSERT.call(this, fnName.synthName === "", 'synth');
//ASSERT.call(this, fnName.ref.scope.isExpr() || fnName.ref.scope.isCtor(), 'fn not an expr');
  var baseName = fnName.name, mname = "", synthName = this.rename(baseName, 0), num = 0;
  var rsList = fnName.ref.rsList;

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname, this.renamer))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth && synth !== fnName)
        continue RENAME;
    }

    break;
  } while (synthName = this.rename(baseName, ++num), true);

  fnName.synthName = synthName;
};

cls.e2b =
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


