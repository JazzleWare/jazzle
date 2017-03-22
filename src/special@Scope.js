this.getSupMem = function() {
  ASSERT.call(this, this.isClass(),
    'a supmem is only reachable through a class');
  if (!this.special.supMem)
    this.special.supMem =
      new Decl().m(DM_MEMSUP).n(_u(RS_SMEM)).r(new Ref(this));

  return this.special.supMem;
};

this.getNewTarget = function() {
  ASSERT.call(this, this.isAnyFnBody(),
    'a newTarget is only reachable through an fnbody');
  if (!this.special.newTarget)
    this.special.newTarget =
      new Decl().m(DM_NEW_TARGET).n(_u(RS_NTARGET)).r(new Ref(this));

  return this.special.newTarget;
};

this.getThis = function(ref) {
  ASSERT.call(
    this,
    this.isModule() || this.isAnyFnBody() || this.isScript(),
    'a this is only reachable through a module, fnbody, or script');
  if (!this.special.lexicalThis)
    this.special.lexicalThis =
      new Decl().m(DM_LTHIS).n(_u(RS_THIS)).r(ref);

  return this.special.lexicalThis;
};

this.getArguments = function(ref) {
  ASSERT.call(this, this.isAnyFnHead(),
    'any special handling of arguments is only allowed from an fn-head');

  var argDecl = this.findDecl_m(RS_ARGUMENTS);
  if (!argDecl)
    argDecl = this.special.arguments =
      new Decl().m(DM_ARGUMENTS).n('arguments').r(ref);

  return argDecl;
};

this.getSupCall = function() {
  ASSERT.call(this, this.isClass(),
    'a call to super is only reachable through a class');
  if (!this.special.supCall)
    this.special.supCall =
      new Decl().m(DM_CALLSUP).n(_u(RS_SCALL)).r(new Ref(this));

  return this.special.supCall;
};
