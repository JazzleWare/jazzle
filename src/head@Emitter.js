this.emitSourceHead =
function(n) {
  var scope = n['#scope'], em = 0;
  this.emitFunList(scope, em) && em++;
  this.emitVarList(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  return em;
};

this.emitFnHead =
function(n) {
  var scope = n['#scope'], em = 0;
  this.emitFunList(scope, em) && em++;
  this.emitVarList(scope, em) && em++;
  this.emitTempList(scope, em) && em++;
  return em;
};

this.emitSimpleHead =
function(n) {
  var scope = n['#scope'], em = 0;
  this.emitLLINOSAList(scope, em) && em++;
  this.emitFunList(scope, em) && em++;
  return em;
};

this.emitVarList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var u = null, o = {v: false};
  if (hasPrev) {
    if (!this.wcb) this.onw(wcb_afterStmt);
    if (!this.wcbUsed) this.wcbUsed = u = o;
    else u = this.wcbUsed;
  }
  var list = scope.defs, i = 0, len = list.length(), em = 0;
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.isVar()) continue;
    em ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    em++;
  }
  em && this.w(';');
  if (u && u === o)
    u.v || this.clear_onw();
  return em;
};

this.emitTempList =
function(scope, hasPrev) {
  ASSERT.call(this, scope.isSourceLevel() || scope.isAnyFn(), 'source/fn');
  var u = null, o = {v: false};
  if (hasPrev) {
    if (!this.wcb) this.onw(wcb_afterStmt);
    if (!this.wcbUsed) this.wcbUsed = u = o;
    else u = this.wcbUsed;
  }
  var list = scope.getLG('<t>'), i = 0, len = list ? list.length : 0;
  while (i < len) {
    var elem = list.getL(i);
    i ? this.w(',').os() : this.w('var').bs();
    this.w(elem.synthName);
    i++;
  }
  i && this.w(';');
  if (u && u === o)
    u.v || this.clear_onw();
  return i;
};

this.emitFunList =
function(scope, hasPrev) {};
