  import {ST_FN, ST_CATCH, ST_SCRIPT, ST_MODULE, ST_CLS, ST_GEN, ST_ASYNC, ST_GETTER, ST_SETTER, ST_CLSMEM, ST_STATICMEM, ST_OBJMEM, ST_ARROW, ST_BLOCK, ST_BARE, ST_CTOR, ST_DECL, ST_PAREN, ST_EXPR, ST_BUNDLE, ST_GLOBAL} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.isAnyFn = 
function() { return this.type & ST_FN; };

cls.isCatch = 
function() { return this.type & ST_CATCH; };

cls.isScript = 
function() { return this.type & ST_SCRIPT; };

cls.isModule = 
function() { return this.type & ST_MODULE; };

cls.isClass = 
function() { return this.type & ST_CLS; };

cls.isGen = 
function() { return this.type & ST_GEN; };

cls.isAsync = 
function() { return this.type & ST_ASYNC; };

cls.isGetter = 
function() { return this.type & ST_GETTER; };

cls.isSetter = 
function() { return this.type & ST_SETTER; };

cls.isClassMem = 
function() { return this.type & ST_CLSMEM; };

cls.isStaticMem = 
function() { return this.type & ST_STATICMEM; };

cls.isObjMem = 
function() { return this.type & ST_OBJMEM; };

cls.isMem =
function() { return this.isClassMem() || this.isStaticMem() || this.isObjMem(); };

cls.isArrow = 
function() { return this.type & ST_ARROW; };

cls.isBlock =
function() { return this.type & ST_BLOCK; };

cls.isBare =
function() { return this.type & ST_BARE; };

cls.isCtor = 
function() { return this.type & ST_CTOR; };

cls.isLexicalLike =
function() {
  return this.isBlock() || this.isCatch();
};

cls.isDecl = 
function() { return this.type & ST_DECL; };

cls.isParen =
function() { return this.type & ST_PAREN; };

cls.isHoisted =
function() { return this.isAnyFn() && this.isDecl(); };

cls.isExpr = 
function() { return this.type & ST_EXPR; };

cls.isBootable =
function() {
  return this.isScript() || this.isAnyFn() || this.isCatch() || this.isModule() || this.isBundle() || this.isGlobal();
};

cls.isSourceLevel = 
function() { return this.isScript() || this.isModule(); };

cls.isSimpleFn =
function() { return this.type & (ST_EXPR|ST_DECL); };

cls.isBundle =
function() { return this.type & ST_BUNDLE; };

cls.isGlobal =
function() { return this.type & ST_GLOBAL; };

cls.isConditional = 
function() { return this.flags & ST_COND; };

cls.isConcrete =
function() { return this.isModule() || this.isAnyFn() || this.isScript() || this.isBundle(); };

cls.isSoft = 
function() {
  return this.isBlock() ||
         this.isClass() ||
         this.isCatch() ||
         this.isParen() ||
         this.isBare();
};


