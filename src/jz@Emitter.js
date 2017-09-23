this.emitJFn =
function() {
  var jzcalls = this.jzcalls;
  var len = jzcalls.length();
  if (len === 0) return;

  var n = new Parser(defaultJZ).parseProgram();
  var t = new Transformer();
  n = t.tr(n, false);

  var l = 0;
  var scope = n['#scope'];
  while (l < len) {
    var nd = scope.findDeclOwn_m(_m(jzcalls.at(l)));
    ASSERT.call(this, nd, jzcalls.at(l));
    nd.activeness = ANESS_ACTIVE;
    l++;
  }

  var e = new Emitter();

  e.allow.elemShake = true;
  e.wm('function',' ','jz','(',')','','{').i().onw(wcb_afterStmt).eA(n, EC_NONE, true).l();
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
