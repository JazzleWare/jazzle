this.transformCls =
function(n, isVal, oBinding) { // o -> outer
  var scope = this.setScope(n['#scope']), ex = oBinding === null;
  var ctor = n['#ct'] && n['#ct'].value, reached = {v: true};
  var list = [];

  var tempsup = null, tempsupSave = null, s = null;
  if (n.superClass) {
    n.superClass = this.tr(n.superClass, true);
    tempsup = this.allocTemp();
    tempsupSave = this.synth_TempSave(tempsup, n.superClass);
    s = ctor && ctor['#scope'].spSuperCall;
  }

  if (null === ctor) ctor = this.syntheticCtor(n, tempsup);
  else {
    ctor = this.transformCtor(ctor, oBinding, reached);
    if (s) { ctor.scall = { inner: s, outer: tempsup } };
  }
  var clsTemp = null;
  var classSave = null;
  if (ex) {
    clsTemp = this.allocTemp();
    classSave = this.synth_TempSave(clsTemp, ctor);
  } else
    classSave = this.synth_ClassSave(oBinding, ctor);

  var jzCreateCls = this.synth_MakeClass(clsTemp, tempsup, oBinding);
  var tproto = null;

  var memList = n.body.body, i = 0;
  var m = 0;
  while (i < memList.length) {
    var elem = memList[i];
    if (elem.kind === 'constructor') {
      memList[i++] = null;
      continue;
    }
    if (m === 0) {
      tproto = tempsup || this.allocTemp();
      jzCreateCls = this.synth_TempSave(tproto, jzCreateCls);
    }
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    var mem = elem.value = this.transformMem(elem.value, oBinding, reached);
    if (mem.cls) mem.cls.outer = clsTemp;
    m++;
    i++;
  }

  tempsupSave && list.push(tempsupSave );
  list. push(classSave);
  list. push(jzCreateCls);

  if (m) {
    var classcut = this.synth_MemList(memList, tproto);
    list. push(classcut);
  }

  if (isVal) {
    ASSERT.call(this, oBinding === null, 'binding');
    ASSERT.call(this, clsTemp !== null, 'cls');
    list.push(clsTemp);
  }

  tproto && tproto !== tempsup && this.releaseTemp(tproto);
  clsTemp && this.releaseTemp(clsTemp);
  tempsup && this.releaseTemp(tempsup );

  oBinding && this.makeReached(oBinding);
  this.setScope(scope);

  return this.synth_AssigList(list);
};

this.transformCtor =
function(ctor, oBinding, r) {
  var r0 = null;
  if (oBinding) {
    r0 = oBinding.reached;
    oBinding.type |= DT_CLSNAME;
    oBinding.reached = r;
    ctor = this.transformRawFn(ctor, true) ;
    oBinding.reached = r0;
    oBinding.type &= ~DT_CLSNAME;
    return ctor;
  }
  var scope = ctor['#scope'];
  REF: { 
    var clsName = ctor['#scope'].parent.scopeName;
    if (clsName === null) break REF;
    var ref = scope.findRefU_m(_m(clsName.name));
    if (ref === null || ref.getDecl() !== clsName) break REF;
    var sn = scope.scopeName = new ScopeName(clsName.name, null).t(DT_FNNAME); 

    sn.r(new Ref(scope));

    ref.hasTarget = false;
    ref.parentRef = null;
    ref.targetDecl = null;
    sn.ref.absorbDirect(ref);
  }

  return this.transformExprFn(ctor);
};

this.transformMem =
function(mem, oBinding, r) {
  var r0 = null, scope = mem['#scope'], cls = scope.parent;
  if (oBinding) {
    r0 = oBinding.reached;
    oBinding.type |= DT_CLSNAME;
    oBinding.reached = r;
    mem = this.transformExprFn(mem);
    oBinding.reached = r0;
    oBinding.type &= ~DT_CLSNAME;
    return mem;
  }

  var sn = null;
  REF:
  if (cls.scopeName && !cls.scopeName.isInsignificant()) {
    sn = cls.scopeName;
    var ref = scope.findRefU_m(_m(sn.name));
    if (ref === null) { sn = null; break REF; }
    ASSERT.call(this, sn === ref.getDecl(), 'sn' );
    sn = new ScopeName(sn.name, null).t(DT_CLSNAME);
    ASSERT.call(this,scope.parent.isClass(),'cls');
    sn.r(new Ref(scope.parent));

    ref.hasTarget = false;
    ref.parentRef = null;
    ref.targetDecl = null;
    sn.ref.absorbDirect(ref);

    this.makeReached(sn);
    this.synthFnExprName(sn);
  }

  mem = this.transformExprFn(mem);
  if (sn) mem.cls = { inner: sn, outer: null };

  return mem;
};

this.syntheticCtor =
function(cls, heritage) {
  return {
    kind: 'synthc',
    heritage: heritage,
    name: cls['#scope'].scopeName,
    type: '#Untransformed'
  };

};

Transformers['ClassExpression'] =
function(n, isVal) {
  return this.transformCls(n, isVal, null);
};

Transformers['ClassDeclaration'] =
function(n, isVal) {
  var target = this.cur.findDeclOwn_m(_m(n.id.name));
  return this.transformCls(n, isVal, target);
};
