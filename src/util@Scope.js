// function component: function head or function body
this.isGlobal = function() { return this.type & ST_GLOBAL; };
this.isModule = function() { return this.type & ST_MODULE; };
this.isScript = function() { return this.type & ST_SCRIPT; };
this.isDecl = function() { return this.type & ST_DECL; };
this.isClass = function() { return this.type & ST_CLS; };
this.isAnyFnComp = function() { return this.type & ST_ANY_FN; };
this.isAnyFnHead = function() {
  return this.isAnyFnComp() && this.isHead();
};
this.isAnyFnBody = function() {
  return this.isAnyFnComp() && this.isBody();
};
this.isClassMem = function() { return this.type & ST_CLSMEM; };
this.isGetterComp = function() { return this.type & ST_GETTER; };
this.isSetterComp = function() { return this.type & ST_SETTER; };
this.isStaticMem = function() { return this.type & ST_STATICMEM; };
this.isCtorComp = function() { return this.type & ST_CTOR; };
this.isObjMem = function() { return this.type & ST_OBJMEM; };
this.isArrowComp = function() { return this.type & ST_ARROW; };
this.isBlock = function() { return this.type & ST_BLOCK; };
this.isCatchComp = function() { return this.type & ST_CATCH; };
this.isBody = function() { return this.type & ST_BODY; };
this.isMethComp = function() { return this.type & ST_METH; };
this.isExpr = function() { return this.type & ST_EXPR; };
this.isMem = function() { return this.isStaticMem() || this.isClassMem() || this.isObjMem(); };
this.isGenComp = function() { return this.type & ST_GEN; };
this.isAsyncComp = function() { return this.type & ST_ASYNC; };
this.isAccessorComp = function() { return this.isGetterComp() || this.isSetterComp(); };
this.isSpecialComp = function() { return this.isAccessorComp() || this.isGenComp(); };
this.isLexical = function() { return this.isCatchBody() || this.isBlock(); };
this.isTopLevel = function() { return this.type & ST_TOP; };
this.isHoistable = function() { return this.isSimpleFnComp() && this.isDecl(); };
this.isIndirect = function() { return this.isAnyFnComp() || this.isClass(); };
this.isConcrete = function() { return this.type & ST_CONCRETE; };
this.isSimpleFnComp = function() { return this.type & ST_FN; };
this.isBare = function() { return this.isBody() && !(this.isLexical() || this.isAnyFnComp()); };
this.isCatchBody = function() { return this.isCatchComp() && this.isBody(); };
this.isCatchHead = function() { return this.isCatchComp() && this.isHead(); };
this.isHead = function() { return this.type & ST_HEAD; };
this.isParen = function() { return this.type & ST_PAREN; };

this.insideIf = function() { return this.mode & SM_INSIDE_IF; };
this.insideLoop = function() { return this.mode & SM_LOOP; };
this.insideStrict = function() { return this.mode & SM_STRICT; };
this.insideBlock = function() { return this.mode & SM_BLOCK; };
this.insideFuncArgs = function() { return this.mode & SM_INARGS; };
this.insideForInit = function() { return this.mode & SM_FOR_INIT; };
this.insideUniqueArgs = function() { return this.mode & SM_UNIQUE; };

this.canReturn = function() { return this.allowed & SA_RETURN; };
this.canContinue = function() { return this.allowed & SA_CONTINUE; };
this.canBreak = function() { return this.allowed & SA_BREAK; };
this.canDeclareLetOrClass = function() {
  return this.isAnyFnBody() || this.isTopLevel() || this.isLexical() || this.insideForInit();
};
this.canDeclareFunc = function() {
  if (this.insideStrict())
    return false;

  return this.isTopLevel() ||
         this.isAnyFnBody() ||
         this.isLexical() ||
         this.insideIf();
};

this.canYield = function() { return this.allowed & SA_YIELD; };
this.canAwait = function() { return this.allowed & SA_AWAIT; };
this.canSupCall = function() {
  return this.isArrowComp() ?
    this.parent.canSupCall() :
    this.allowed & SA_CALLSUP 
};

this.canSupMem = function() {
  return this.isArrowComp() ?
    this.parent.canSupMem() :
    this.allowed & SA_MEMSUP;
};

this.canHaveNewTarget = function() {
   return this.isArrowComp() ?
     this.parent.canHaveNewTarget() :
     this.isAnyFnComp();
};

this.canDup = function() {
  ASSERT.call(this, this.insideFuncArgs(),
    'it has no meaning to call canDup when not ' +
    'in func-arguments');
  return !this.insideStrict() &&
         !this.insideUniqueArgs();
};

this.enterForInit = function() {
  ASSERT.call(this, this.isBare(),
    'to enter for init mode, the scope has to be a bare one');
  
  this.mode |= SM_FOR_INIT;
};

this.exitForInit = function() {
  ASSERT.call(this, this.insideForInit(),
    'can not unset the for-init mode when it is not set');

  this.mode &= ~SM_FOR_INIT;
};

this.enterStrict = function() {
  this.mode |= SM_STRICT;
};

this.exitStrict = function() {
  ASSERT.call(this, this.insideStrict(),
    'can not unset strict when it is not set');
  this.mode &= ~SM_STRICT;
};

this.yieldIsKW = function() { return this.mode & SM_YIELD_KW; };
this.awaitIsKW = function() { return this.mode & SM_AWAIT_KW; };

this.hasHeritage = function() {
  ASSERT.call(this, this.isClass(),
    'only classes are allowed to be tested for '+
    'heritage');
  return this.mode & SM_CLS_WITH_SUPER;
};
