this.determineActions =
function() {
  if (this.isParen())
    return this.parent.allowed;

  var a = SA_NONE;
  if (this.isSoft())
    a |= this.parent.actions;
  else if (this.isAnyFn()) {
    a |= SA_RETURN;
    if (this.isCtor())
      a |= SA_CALLSUP;
    if (this.isGen())
      a |= SA_YIELD;
    if (this.isAsync())
      a |= SA_AWAIT;
    if (this.isMem())
      a |= SA_MEMSUPER;
  }

  return a;
};

this.determineFlags =
function() {
  if (this.isParen())
    return this.parent.flags;

  var fl = SF_NONE;
  if (!this.parent) {
    ASSERT.call(this, this.isGlobal(),
      'global scope is the only scope that ' +
      'can have a null parent');
    return fl;
  }

  if (this.isClass() || this.isModule() ||
    this.parent.insideStrict())
    fl |= SF_STRICT;

  if (!this.isAnyFn() && this.parent.insideLoop())
    fl |= SF_LOOP;

  if (this.isAnyFn() && this.isMem())
    fl |= SF_UNIQUE;

  return fl;
};

this.setName =
function(name, snType, sourceDecl) {
  ASSERT.call(this, this.canHaveName(),
    'only cls/fn can have a name');
  ASSERT_EQ.call(this, this.scopeName, null);
  this.scopeName = 
    new ScopeName(name, snType, sourceDecl).r(new Ref(this));

  return this.scopeName;
};
