this.getArguments = function(ref) {
  if (this.isArrowComp())
    return null;
  if (!this.special.arguments) {
    var decl = new Decl();
    this.special.arguments =
      decl.r(ref).n(_u(RS_ARGUMENTS));
  }

  return this.special.arguments;
};

this.getMemSuper = function(ref) {
  if (this.isArrowComp())
    return null;

  // TODO: object must have a scope that intercepts
  // the references to supermem
  if (this.isObjMem())
    return objectSuper();

  ASSERT.call(
    this,
    this.isClassMem(),
    'only methmems can have supmem');

  if (!this.cls().special.calledSuper) {
    var decl = new Decl();
    this.cls().special.smem =
      decl.r(ref).n(_u(RS_SMEM));
  }

  return this.cls().special.smem;
};

this.getCalledSuper = function(ref) {
  if (this.isArrowComp())
    return null;

  ASSERT.call(
    this,
    this.isCtor(),
    'only a constructor is allowed to call super');

//ASSERT.call(
//  this,
//  this.parent.isClass(),
//  'a ctor can only have a parent of type class');

  if (!this.parent.special.scall) {
    var decl = new Decl();
    this.parent.special.scall = 
      decl.r(ref).n(_u(RS_MEM));
  }

  return this.parent.special.scall;
};

this.getNewTarget = function(ref) {
  if (this.isArrowComp())
    return null;

  if (!this.special.newTarget) {
    var decl = new Decl();
    this.special.newTarget =
      decl.r(ref).n(_u(RS_NTARGET));
  }

  return this.special.newTarget;
};

this.getLexicalThis = function(ref) {
  if (this.isArrowComp())
    return null;

  if (!this.special.lexicalThis) {
    var decl = new Decl();
    this.special.lexicalThis =
      decl.r(ref).n(_u(RS_LTHIS));
  }

  return this.special.lexicalThis;
};
