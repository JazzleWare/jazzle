  import {ASSERT, EC_NONE} from '../other/constants.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {ATS_SAME} from '../other/scope-constants.js';
  import {CB} from '../other/util.js';
  import {cls} from './cls.js';

cls.emitSourceHead =
function(n) {
  var scope = n['#scope'], em = 0;
  this.emitJ(scope, em) && em++;
  this.emitTCheckVar(scope, em) && em++;
  this.emitThisRef(scope, em) && em++;
  this.emitFunLists(scope, true, em) && em++;
  this.emitVarList(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  return em;
};

cls.emitFnHead =
function(n) {
  var scope = n.fun['#scope'], em = 0;
  this.emitTCheckVar(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  this.emitThisRef(scope,em) && em++;
  this.emitThisChk(scope,em) && em++;
  this.emitArgumentsRef(scope,em) && em++;
  if (n.argsPrologue) this.emitTransformedArgs(n, em) && em++;
  this.emitFunLists(scope, true, em) && em++;
  this.emitVarList(scope, em) && em++;
  return em;
};

cls.emitSimpleHead =
function(n) {
  var scope = n['#scope'], em = 0;
  scope.hasTZCheckPoint && this.emitTCHP(scope, em) && em++;
  this.emitLLINOSAList(scope, em) && em++;
  this.emitFunLists(scope, false, em) && em++;
  return em;
};

cls.emitVarList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var list = scope.defs, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.isVar()) continue;
    if (elem.isFn() || elem.isFnArg()) continue;
    em ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    em++;
  }
  em && this.w(';');
  own.used || this.grmif(own);
  return em;
};

cls.emitTempList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var list = scope.getLG('<t>'), i = 0, len = list ? list.length : 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.getL(i);
    i ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    i++;
  }

  i && this.w(';');
  own.used || this.grmif(own);
  return i;
};

cls.emitFunLists =
function(scope, allowsDecl, hasPrev) {
  var list = scope.funLists, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len)
    this.emitFunList_subList(list.at(i++), allowsDecl, em) && em++;

  own.used || this.grmif(own);
  return em;
};

cls.emitLLINOSAList =
function(scope, hasPrev) {
  ASSERT.call(this, !scope.isSourceLevel() && !scope.isAnyFn(), 'scope/fn');
  var list = scope.defs, i = 0, len = list.length(), em = 0;
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.isLLINOSA()) continue;
    em ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName).os().w('=').os().wm('{','v',':','','void').bs().wm('0','}');
    em++;
  }

  em && this.w(';');
  own.used || this.grmif(own);
  return em;
};

cls.emitFunList_subList =
function(funList, allowsDecl, hasPrev) {
  var i = 0, em = 0;
  var own = {used: false}, lsn = null; 
  hasPrev && this.trygu(wcb_afterStmt, own);
  while (i < funList.length) {
    this.emitSingleFun(funList[i], allowsDecl, i, em) && em++;
    i++;
  }
  own.used || this.grmif(own);
  return em;
};

cls.emitThisRef =
function(scope, hasPrev) {
  var th = scope.spThis;
  if (th === null) return 0;
  if (th.ref.i === 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.w('var').bs().w(th.synthName).os().w('=').os().w('this').w(';');

  own.used || this.grmif(own);
  return 1;
};

cls.emitSingleFun =
function(n, allowsDecl, i, hasPrev) {
  var scope = n.fun['#scope'];
  var target = n.target;

  ASSERT.call(this, target, 'n.target' );

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  if (allowsDecl && scope.scopeName.getAS() === ATS_SAME)
    this.emitTransformedFn(n, EC_NONE, true);
  else {
    var ll = target.isLLINOSA();
    if (i === 0 && !ll)
      this.w('var').bs();
    this.w(target.synthName);
    ll && this.wm('.','v');
    this.wm('','=','');
    n.target = null;
    scope.scopeName.synthName = scope.scopeName.name;
    this.emitExprFn(n, EC_NONE, false);
    this.w(';'); // could have been done above, with true instead of false
  }

  own.used || this.grmif(own);
  return 1;
};

cls.emitTCheckVar =
function(scope, hasPrev) {
  var tg = scope.getLG('tz');
  if (tg === null) return 0;
  tg = tg.getL(0);
  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  this.w('var').bs().w(tg.synthName).os().w('=').os().w(scope.di0+"").w(';');
  own.used || this.grmif(own);
  return 1;
};

cls.emitTransformedArgs =
function(n, hasPrev) {
  var ta = n.argsPrologue;
  if (ta === null)
    return 0;
  var b = CB(n.fun);

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
 
  this.emitStmt(ta);
  this.emc(b, 'inner');

  own.used || this.grmif(own);
  return 1;
};

cls.emitTCHP =
function(scope, hasPrev) {
  var tg = scope.scs.getLG('tz').getL(0);
  if (tg === null)
    return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.wm(tg.synthName,'=',scope.di0+"",';');

  own.used || this.grmif(own);
  return 1;
};

cls.emitArgumentsRef =
function(scope, hasPrev) {
  var ar = scope.spArguments;
  if (ar === null) return 0;
  if (ar.ref.i === 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);

  this.wm('var',' ',ar.synthName,'','=','','arguments',';');

  own.used || this.grmif(own);
  return 1;
};

cls.emitThisChk =
function(scope, hasPrev) {
  var ti = scope.getLG('ti');
  if (ti === null) return 0;
  ti = ti.getL(0);
  if (ti === null || ti.ref.d <= 0) return 0;

  var own = {used: false};
  hasPrev && this.trygu(wcb_afterStmt, own);
  this.wm('var',' ',ti.synthName,'','=','','0',';');

  own.used || this.grmif(own);
  return 1;
};

cls.emitJ =
function(scope, hasPrev) {
  return 0;
  var own = false, u = null, o = {v: false};
  if (hasPrev) {
    if (!this.wcb) { this.onw(wcb_afterStmt); own = true; }
    if (!this.wcbUsed) this.wcbUsed = u = o;
    else u = this.wcbUsed;
  }

  this.wm('jz','','=','','jz','(',')',';');

  if (own) u.v || this.clear_onw();
  return 1;
};


