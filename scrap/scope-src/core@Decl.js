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

this.isGlobal = function() {
  return this.mode & DM_GLOBAL;
};

this.isScopeName = function() {
  return this.mode & DM_SCOPENAME;
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

  var diRoot = this.ref.scope.scs;

  if (diRoot.isAnyFnBody())
    diRoot = diRoot.funcHead;

  this.i = diRoot.diRef.v++;

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
  if (this.mightNeedTest() && !this.hasTZ) {
    this.hasTZ = true;
    if (!this.ref.scope.hasTZ)
      this.ref.scope.hasTZ = true;
  }

  return this;
};

this.mightNeedTest = function() {
  return !this.isVName() && !this.isFunc() && !this.isGlobal();
};

this.associateWithLiquid = function(liquid) {
  ASSERT.call(this, this.liquid === null,
    'this decl has already been associated with a liquid');
  liquid.associateWith(this);
  this.liquid = liquid;
};

this.isActuallyLiquid = function() {
  return this.liquid !== null;
};

this.isInsignificant = function() {
  return this.type & DM_INSIGNIFICANT_NAME;
};

// Loop Lexical In Need Of Special Attention y'know
this.isLlinosa = function() {
  return this.isLexical() && this.ref.scope.insideLoop() && this.ref.indirect;
};
