this.isHoistedInItsScope = function() {
  return this.mode & DM_FUNCTION;
};

this.isVarLike = function() {
  if (this.isFunc())
    return this.ref.scope.isConcrete();
  return this.isVName() ||
         this.isFuncArg();
};

this.isLexical = function() {
  if (this.isFunc())
    return this.ref.scope.isLexical();
  return this.isClass() ||
         this.isLName() ||
         this.isCName();
};

this.isTopmostInItsScope = function() {
  return this.isFuncArg() ||
         this.isCatchArg() ||
         this.isHoistedInItsScope() ||
         this.isVarLike();
};

this.isClass = function() {
  return this.mode & DM_CLS;
};

this.isCatchArg = function() {
  return this.mode & DM_CATCHARG;
};

this.isFunc = function() {
  return this.mode & DM_FUNCTION;
};

this.isFuncArg = function() {
  return this.mode & DM_FNARG;
};

this.isVName = function() {
  return this.mode & DM_VAR;
};

this.isLName = function() {
  return this.mode & DM_LET;
};

this.isCName = function() {
  return this.mode & DM_CONST;
};

this.isName = function() {
  return this.mode &
    (DM_VAR|DM_LET|DM_CONST);
};

this.absorbRef = function(otherRef) {
  ASSERT.call(this, !otherRef.resolved,
    'a resolved reference must not be absorbed by a declref');

  var fromScope = otherRef.scope;
  var cur = this.ref;
  
  if (fromScope.isIndirect()) {
    if (fromScope.isHoisted() &&
        !this.isTopmostInItsScope())
      cur.indirect.fw += ref.total();
    else
      cur.indirect.ex += ref.total()
  } else {
    cur.indirect.ex += ref.indirect.total();
    cur.direct.ex += ref.direct.total();
  }

  return cur;
};

this.m = function(mode) {
  ASSERT.call(this, this.mode === DM_NONE,
    'can not change mode');
  this.mode = mode;
  return this;
};

this.r = function(ref) {
  ASSERT.call(this, this.ref === null,
    'can not change ref');
  this.ref = ref;
  this.i = this.ref.scope.iRef.v++;
  return this;
};

this.n = function(name) {
  ASSERT.call(this, this.name === "",
    'can not change name');
  this.name = name;
  return this;
};

this.s = function(site) {
  ASSERT.call(this, this.site === null,
    'can not change site');
  this.site = site;
  return this;
};
