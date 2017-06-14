this.isAnyFn = 
function() { return this.type & ST_FN; };

this.isCatch = 
function() { return this.type & ST_CATCH; };

this.isScript = 
function() { return this.type & ST_SCRIPT; };

this.isModule = 
function() { return this.type & ST_MODULE; };

this.isClass = 
function() { return this.type & ST_CLS; };

this.isGen = 
function() { return this.type & ST_GEN; };

this.isAsync = 
function() { return this.type & ST_ASYNC; };

this.isGetter = 
function() { return this.type & ST_GETTER; };

this.isSetter = 
function() { return this.type & ST_SETTER; };

this.isClassMem = 
function() { return this.type & ST_CLSMEM; };

this.isStaticMem = 
function() { return this.type & ST_STATICMEM; };

this.isObjMem = 
function() { return this.type & ST_OBJMEM; };

this.isMem =
function() { return this.isClassMem() || this.isStaticMem() || this.isObjMem(); };

this.isArrow = 
function() { return this.type & ST_ARROW; };

this.isBlock =
function() { return this.type & ST_BLOCK; };

this.isBare =
function() { return this.type & ST_BARE; };

this.isCtor = 
function() { return this.type & ST_CTOR; };

this.isLexicalLike =
function() {
  return this.isBlock() || this.isCatch();
};

this.isDecl = 
function() { return this.type & ST_DECL; };

this.isParen =
function() { return this.type & ST_PAREN; };

this.isHoisted =
function() { return this.isAnyFn() && this.isDecl(); };

this.isExpr = 
function() { return this.type & ST_EXPR; };

this.isBootable =
function() {
  return this.isScript() || this.isAnyFn() || this.isCatch() || this.isModule();
};

this.isBooted =
function() {
  return this.synthNamesUntilNow !== null;
};

this.isSourceLevel = 
function() { return this.isScript() || this.isModule(); };

this.isSimpleFn =
function() { return this.type & (ST_EXPR|ST_DECL); };

this.isBundle =
function() { return this.type & ST_BUNDLE; };

this.isGlobal =
function() { return this.type & ST_GLOBAL; };

this.isConditional = 
function() { return this.flags & ST_COND; };

this.isConcrete =
function() { return this.isModule() || this.isAnyFn() || this.isScript() || this.isBundle(); };

this.isSoft = 
function() {
  return this.isBlock() ||
         this.isClass() ||
         this.isCatch() ||
         this.isParen() ||
         this.isBare();
};
