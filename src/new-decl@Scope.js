this.declareHoisted_m =
function(mname, t) {
  var tdecl = this.findDeclAny_m(mname);

  if (tdecl) {
    if (tdecl.isOverridableByVar())
      return tdecl;
    this.err('var.can.not.override.existing');
  }

  var tscope = null;
  var isNew = false;

  tdecl = this.findVarTarget_m(mname);
  if (!tdecl) {
    tscope = this.scs;
    tdecl = new Decl().t(t).n(_u(mname)).r(tscope.rocRefU_m(mname));
    ASSERT.call(this, !tscope.findDeclAny_m(mname), 'override is not allowed');
    isNew = true;

  }
  else { tscope = tdecl.ref.scope; }

  this.insertDecl_m(mname, tdecl);

  if (this !== tscope)
    this.parent.hoistName_m(mname, tdecl, tscope);

  isNew && tscope.addVarTarget_m(mname, tdecl);

  return tdecl;
};

this.findDeclOwn_m =
function(mname) {
  var tdecl = this.findDeclAny_m(mname);
  if (tdecl && this.owns(tdecl))
    return tdecl;

  return null;
};

this.findDeclAny_m = 
function(mname) {
  return this.defs.has(mname) ?
    this.defs.get(mname) : null;
};

this.hoistName_m =
function(mname, tdecl, tscope, isNew) {
  var cur = this;
  while (true) {
    var existing = cur.findDeclAny_m(mname);
    if (existing) {
      if (existing.isOverridableByVar())
        return;
      this.err('var.can.not.override.existing');
    }

    cur.insertDecl_m(mname, tdecl);
    if (cur === tscope) { break; }

    cur = cur.parent;
    ASSERT.call(this, cur !== null,
      'reached topmost before reaching target');
  }
};

this.findParam_m =
function(mname) {
  ASSERT.call(this, this.isAnyFn() || this.isCatch(),
    'this scope is not an fn/catch, and has no params');
  return HAS.call(this.argMap, mname) ?
    this.argMap[mname] : null;
};

this.declareLexical_m =
function(mname, t) {
  var existing = this.findDeclAny_m(mname);
  if (!existing) {
    if (this.isAnyFn() || this.isCatch())
      existing = this.findParam_m(mname);
  }
  if (existing)
    this.err('lexical.can.not.override.existing');

  var newDecl = null;
  newDecl = new Decl().t(t).n(_u(mname)).r(this.rocRefU_m(mname));
  this.insertDecl_m(mname, newDecl);

  return newDecl;
};

this.decl_m = function(mname, dt) {
  switch (dt) {
  case DT_LET:
    return this.decl_let_m(mname, dt);
  case DT_FN:
    return this.decl_fn_m(mname, dt);
  case DT_CONST:
    return this.decl_const_m(mname, dt);
  case DT_VAR:
    return this.decl_var_m(mname, dt);
  case DT_CLS:
    return this.decl_cls_m(mname, dt);
  case DT_CATCHARG:
    return this.decl_catchArg_m(mname, dt);
  case DT_FNARG:
    return this.decl_fnArg_m(mname, dt);
  }

  ASSERT.call(this, false, 'unknown decltype');
};

this.decl_let_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_fn_m =
function(mname, t) {
  return this.isLexicalLike() ?
    this.declareLexical_m(mname, t) :
    this.declareHoisted_m(mname, t);
};

this.decl_const_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_var_m =
function(mname, t) {
  return this.declareHoisted_m(mname, t);
};

this.decl_cls_m =
function(mname, t) {
  return this.declareLexical_m(mname, t);
};

this.decl_catchArg_m =
function(mname, t) {
  ASSERT.call(this, this.isCatch() && !this.inBody,
    'only catch heads are allowed to declare args');

  var existing = this.findDeclAny_m(mname);
  if (existing)
    this.err('var.catch.is.duplicate');

  var newDecl = null;

  newDecl = new Decl().t(t).n(_u(mname)).r(this.rocRefU_m(mname));

  this.insertDecl_m(mname, newDecl);
  this.addVarTarget_m(mname, newDecl);

  return newDecl;
};

this.decl_fnArg_m =
function(mname, t) {
  ASSERT.call(this, this.isAnyFn() && !this.inBody,
    'only fn heads are allowed to declare args');

  var ref = this.findRefAny_m(mname),
      newDecl = new Decl().t(t).n(_u(mname));

  var existing = HAS.call(this.argMap, mname) ?
    this.argMap[mname] : null;

  if (existing) {
    this.canDup() || this.err('var.fn.is.dup.arg');
    if (!this.firstDup)
      this.firstDup = existing;
    newDecl.ref = ref; // unnecessary; also, no  Decl::`r() is not needed -- `ref.hasTarget` holds
  }
  else {
    ref = this.rocRefU_m(mname);
    newDecl.r(ref);
    this.argMap[mname] = newDecl;
    this.addVarTarget_m(mname, newDecl);
  }

  this.argList.push(newDecl);
  return newDecl;
};

this.insertDecl_m =
function(mname, newDecl) {
  this.defs.set(mname, newDecl);
};
