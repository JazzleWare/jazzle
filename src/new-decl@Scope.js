this.declareHoisted_m =
function(mname, t) {
  var tdecl = this.findDecl_m(mname);

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
    tdecl = new Decl()
      .t(t)
      .n(_u(mname))
      .r(new Ref(scs));
    isNew = true;
    this.insertDecl(mname, tdecl);
  }
  else { tscope = tdecl.scope; }

  if (this !== tscope)
    this.parent.hoistName_m(mname, tdecl, tscope, isNew);

  return tdecl;
};

this.findDecl_m = 
function(mname) {
  return this.defs.has(mname) ?
    this.defs.get(mname) : null;
};

this.hoistName_m =
function(mname, tdecl, tscope, isNew) {
  var cur = this;
  while (true) {
    var existing = cur.findDecl_m(mname);
    if (existing.isOverridableByVar())
      return;
    this.err('var.can.not.override.existing');

    cur.insertDecl(mname, tdecl);
    if (cur === tscope) { break; }

    cur = cur.parent;
    ASSERT.call(this, cur !== null,
      'reached topmost before reaching target');
  }

  isNew && tscope.addVarTarget(mname, tdecl);
};

this.declareLexical_m =
function(mname, t) {
  var existing = this.findDecl_m(mname);
  if (!existing) {
    if (this.isAnyFn() || this.isCatch())
      existing = this.findParam_m(mname);
  }
  if (existing)
    this.err('lexical.can.not.override.existing');

  var newDecl = null;
  var ref = this.findRef_m(mname) || new Ref(this);

  newDecl = new Decl().t(t).n(_u(mname)).r(ref);
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

  var existing = this.findDecl_m(mname);
  if (existing)
    this.err('var.catch.is.duplicate');

  var newDecl = null;
  var ref = this.findRef_m(mname) || new Ref(this);

  newDecl = new Decl().t(t).n(_u(mname)).r(ref);

  this.insertDecl_m(mname, newDecl);
  this.addVarTarget_m(mname, newDecl);

  return newDecl;
};

this.decl_fnArg_m =
function(mname, t) {
  ASSERT.call(this, this.isAnyFn() && !this.inBody,
    'only fn heads are allowed to declare args');

  var ref = this.findRef_m(mname) || new Ref(this),
      newDecl = new Decl().t(t).n(_u(mname));

  var existing = HAS.call(this.paramMap, mname) ?
    this.paramMap[mname] : null;

  if (existing) {
    this.canDup() || this.err('var.fn.is.dup.arg');
    if (!this.firstDup)
      this.firstDup = existing;
    newDecl.ref = ref;
  }
  else {
    newDecl.r(ref);
    this.paramMap[mname] = newDecl;
    this.addVarTarget(mname, newDecl);
  }

  this.paramList.push(newDecl);
  return newDecl;
};

this.insertDecl_m =
function(mname, newDecl) {
  this.defs.set(mname, newDecl);
};
