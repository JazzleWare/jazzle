this.declare = function(name, mode) {
  return this.declare_m(_m(name), mode);
};

this.declare_m = function(mname, mode) {
  if (mode & DM_LET)
    return this.let_m(mname, mode);
  if (mode & DM_FUNCTION)
    return this.function_m(mname, mode);
  if (mode & DM_CONST)
    return this.const_m(mname, mode);
  if (mode & DM_VAR)
    return this.var_m(mname, mode);
  if (mode & DM_CLS)
    return this.class_m(mname, mode);
  if (mode & DM_CATCHARG)
    return this.catchArg_m(mname, mode);
  if (mode & DM_FNARG)
    return this.fnArg_m(mname, mode);

  ASSERT.call(this, false, 'declmode unknown');
};

this.findDecl = function(name) {
  return this.findDecl_m(_m(name));
};

this.let_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.function_m = function(mname, mode) {
  return this.isLexical() ?
    this.declareLexical_m(mname, mode) :
    this.declareVarLike_m(mname, mode);
};

this.const_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.var_m = function(mname, mode) {
  return this.declareVarLike_m(mname, mode);
};

this.class_m = function(mname, mode) {
  return this.declareLexical_m(mname, mode);
};

this.catchArg_m = function(mname, mode) {
  ASSERT.call(this, this.isCatchHead(),
    'only catch heads are allowed to declare catch-args');
  
  var existing = this.findDecl_m(mname);
  if (existing)
    this.parser.err('var.catch.is.dup');

  var newDecl = null;
  var ref = this.findRef_m(mname, true).resolve();

  newDecl = new Decl().m(mode).n(_u(mname)).r(ref);
  this.insertDecl_m(mname, newDecl);

  return newDecl;
};

this.fnArg_m = function(mname, mode) {
  ASSERT.call(this, this.isAnyFnComp() && this.isHead(),
    'only fn heads are allowed to declare fn-args');

  var ref = this.findRef_m(mname, true),
      newDecl = new Decl().m(mode).n(_u(mname)).r(ref);

  var existing = null;
  if (HAS.call(this.paramMap, mname))
    existing = this.paramMap[mname];
  
  if (existing) {
    if (!this.canDup())
      this.parser.err('var.fn.is.dup.arg');

    if (!this.firstDup)
      this.firstDup = newDecl;
  }
  else {
    switch (_u(mname)) {
    case 'eval':
    case 'arguments':
      if (!this.firstEvalOrArguments)
        this.firstEvalOrArguments = newDecl;
    }
    ref.resolve();
    this.paramMap[mname] = newDecl;
  }

  this.paramList.push(newDecl);
  return newDecl;
};

this.declareLexical_m = function(mname, mode) {
  var existing = this.findDecl_m(mname);
  if (!existing && this.isAnyFnBody())
    existing = this.funcHead.findDecl_m(mname);

  if (existing)
    this.err('lexical.can.not.override.existing');

  
  var newDecl = null, ref = this.findRef_m(mname, true).resolve();
  newDecl = new Decl().m(mode).n(_u(mname)).r(ref);

  this.insertDecl_m(mname, newDecl);
  return newDecl;
};

this.declareVarLike_m = function(mname, mode) {
  var dest = null, varDecl = null;
  if (this.isLexical()) {
    var catchScope = this.surroundingCatchScope;
    if (catchScope) {
      varDecl = catchScope.findCatchVar_m(mname);
      if (varDecl) {
        if (!catchScope.hasSimpleList)
          this.err('non.simple.catch.var.is.not.overridable');

        dest = catchScope;
      }
    }
  }

  if (dest === null) {
    dest = this.scs;
    varDecl = dest.findDecl_m(mname);
    if (varDecl) {
      if (!varDecl.isVarLike())
        this.err('var.can.not.override.nonvarlike');
      if (!varDecl.isFunc() && (mode & DM_FUNC))
        varDecl.mode = mode;
    }
  }

  var newDecl = varDecl;
  if (newDecl === null)
    newDecl = new Decl().m(mode).n(_u(mname));

  var cur = this;
  while (cur !== dest) {
    var existing = cur.findDecl_m(mname);
    if (existing) {
      if (!existing.isVarLike())
        this.err('var.can.not.override.nonvarlike');
    }
    else
      cur.insertDecl_m(mname, newDecl);

    cur = cur.parent;
  }

  if (!varDecl) {
    var ref = dest.findRef_m(mname, true).resolve();
    newDecl.r(ref);
    dest.insertDecl_m(mname, newDecl);
  }

  return newDecl;
};

this.findDecl_m = function(mname) {
  return this.defs.has(mname) ?
    this.defs.get(mname) : null;
};

this.insertDecl_m = function(mname, decl) {
  this.defs.set(mname, decl);
};
