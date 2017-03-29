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

this.absorbDirect = function(otherRef) {
  ASSERT.call(this, !otherRef.resolved,
    'a resolved reference must not be absorbed by a declref');

  var cur = this.ref;
  cur.absorbDirect(otherRef);
  return cur;
};

this.absorbIndirect = function(otherRef) {
  ASSERT.call(this, !otherRef.resolved,
    'a resolved reference must not be absorbed by a declref');

  var cur = this.ref;
  cur.absorbIndirect(otherRef);
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
  this.ref = ref.resolveTo(this);
  if (ref.indirect || ref.direct)
    this.useTZ();

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

this.setSynthName = function(synthName) {
  ASSERT.call(this, this.synthName === "",
    'this decl has already got a synth-name');
  this.synthName = synthName;
  return this;
};

this.useTZ = function() {
  if (!this.hasTZ) {
    this.hasTZ = true;
    if (!this.ref.scope.hasTZ)
      this.ref.scope.hasTZ = true;
  }

  return this;
};
