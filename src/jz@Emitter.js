this.emitJFn =
function() {
  var jzcalls = this.jzcalls;
  var len = jzcalls.length();
  if (len === 0) return;

  var n = new Parser(defaultJZ).parseProgram();
  var t = new Transformer();
  n = t.tr(n, false);

  var l = 0;
  var scope = n['#scope'], nd = null;

  var list = jzcalls;
  len = list.length();
  while (l < len) {
    var name = jzcalls.at(l++);
    nd = scope.findDeclOwn_m(_m(name));
    ASSERT.call(this, nd, name);
    nd.activeness = ANESS_ACTIVE;
  }

  list = scope.defs, l = 0, len = list.length();
  while (l < len) {
    nd = list.at(l);
    if (this.active(nd)) {
      var listA = nd.activeIf, lA = 0, lenA = listA ? listA.length() : 0;
      while (lA < lenA) {
        var item = listA.at(lA++);

        // TODO: find a better way
        if (item.role === ACT_DECL && item.isVar() &&  item.ref.scope.scs === scope)
          item.activeness = ANESS_ACTIVE;
      }
    }
    else
      nd.type |= DT_BOMB;
    l++;
  }

  var e = new Emitter();

  e.allow.elemShake = true;
  e.wm('function',' ','jz','(',')','','{').i().onw(wcb_afterStmt).eA(n, EC_JZ, true).l();
  e.w('return').w('{');
  l = 0;
  while (l < len) {
    l && this.w(',');
    var name = jzcalls.at(l++);
    e.wm(name,':','',name);
  }
  e.wm('}',';');
  e.u().l().w('}');
  e.flush();
  return e.out ;
};
