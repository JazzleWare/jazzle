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

this.isArrow = 
function() { return this.type & ST_ARROW; };

this.isCtor = 
function() { return this.type & ST_CTOR; };

this.isConcrete = 
function() { return this.type & (ST_FN|ST_MODULE|ST_SCRIPT); };

this.isDecl = 
function() { return this.type & ST_DECL; };

this.isExpr = 
function() { return this.type & ST_EXPR; };

this.isConditional = 
function() { return this.flags & ST_COND; };

this.isSoft = 
function() {
  return this.isBlock() ||
         this.isClass() ||
         this.isCatch() ||
         this.isParen() ||
         this.isBare();
};