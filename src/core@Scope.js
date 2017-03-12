this.calculateParent = function() {
  if (this.parent.isParen())
    this.parent = this.parent.calculateParen();

  return this.parent;
};

this.calculateAllowedActions = function() {
  if (this.isParen())
    return this.parent.allowed;

  var a = SA_NONE;
  if (this.isLexical() || this.isClass() || this.isCatchHead() || this.isBare())
    a |= this.parent.allowed;
  else if (this.isAnyFnComp()) {
    a |= SA_RETURN;
    if (this.isCtorComp())
      a |= SA_CALLSUP;
    if (this.isGenComp())
      a |= SA_YIELD;
    if (this.isAsyncComp())
      a |= SA_AWAIT;
    if (this.isMem())
      a |= SA_MEMSUP;
  }

  return a;
};

this.calculateScopeMode = function() {
  if (this.isParen())
    return this.parent.mode;

  var m = SM_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal(),
      'global scope is the only scope that ' +
      'can have a null parent');
    return m;
  }

  if (this.isClass() || this.isModule() ||
      this.parent.insideStrict())
    m |= SM_STRICT;

  if (this.isLexical() && this.parent.insideLoop())
    m |= SM_LOOP;

  // catch-heads and non-simple fn-heads
  if (!this.isExpr() && !this.isDecl() && this.isHead())
    m |= SM_UNIQUE;

  return m;
};

this.setName = function(name) {
  ASSERT.call(this, this.isExpr(),
    'the current scope is not an expr scope, and can not have a name');
  ASSERT.call(this, this.scopeName === "",
    'the current scope has already got a name');
  this.scopeName = name;
};

