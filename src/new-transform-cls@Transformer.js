this.transformCls =
function(n, isVal, oBinding) { // o -> outer
  var ex = oBinding === null;
  var ctor = n['#ct'].value;
  var list = [];

  var tempsup = null, tempsupSave = null;
  if (n.superClass) {
    n.superClass = this.tr(n.superClass, true);
    tempsup = this.allocTemp();
    tempsupSave = this.synth_TempSave(tempsup, n.superClass);
  }

  ctor = ctor ? this.transformCtor(ctor, oBinding) : this.syntheticCtor(n);

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
    var elem = memList[i++];
    if (elem.kind === 'constructor')
      continue;
    if (m === 0) {
      tproto = this.allocTemp();
      jzCreateCls = this.synth_TempSave(tproto, jzCreateCls);
    }
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    elem.value = this.transformMem(elem.value, ex);
    m++;
  }

  tempsupSave && list.push(tempsupSave );
  list. push(classSave);
  list. push(jzCreateCls);

  if (m) {
    var classcut = this.synth_ClassSection(memList, tproto);
    list. push(classcut);
  }

  if (isVal) {
    ASSERT.call(this, oBinding === null, 'binding');
    ASSERT.call(this, clsTemp !== null, 'cls');
    list.push(clsTemp);
  }

  tproto && this.releaseTemp(tproto);
  clsTemp && this.releaseTemp(clsTemp);
  tempsup && this.releaseTemp(tempsup );

  return this.synth_AssigList(list);
};

this.transformCtor =
function(ctor, oBinding) {
  var scope = ctor['#scope'];
  REF:
  if (oBinding === null) {
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

  return oBinding ? this.transformRawfn(ctor, true) : this.transformExprFn(ctor);
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
