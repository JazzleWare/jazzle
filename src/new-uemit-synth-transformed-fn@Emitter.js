UntransformedEmitters['transformed-fn'] =
function(n, flags, isStmt) {
  return n.target ?
    this.emitDeclFn(n, flags, isStmt) :
    this.emitExprFn(n, flags, isStmt);
};

this.emitTransformedFn =
function(n, flags, isStmt) {
  var raw = n.fun, cb = CB(raw);
  this.emc(cb, 'bef');
  this.wt('function', ETK_ID );
  this.emc(cb, 'fun.aft');
  var scopeName = raw['#scope'].scopeName;
  if (scopeName) {
    this.bs();
    var name_cb = scopeName.site && CB(scopeName.site);
    name_cb && this.emc(name_cb, 'bef' );
    this.writeIDName(scopeName.name);
    name_cb && this.emc(name_cb, 'aft');
  }
  this.emc(cb, 'list.bef' );
  this.w('(');

  if (raw.params) {
    this.emitCommaList(raw.params);
    this.emc(cb, 'inner');
  }

  var u = null, own = false, o = {v: false}, em = 0;
  this.wm(')','','{').i();

  this.onw(wcb_afterStmt);
  own = true;
  u = this.wcbUsed = o;

  if (this.emitFnHead(n)) {
    em++;
    if (!this.wcb) {
      this.onw(wcb_afterStmt);
      u.v = false;
      this.wcbUsed = u;
    }
  }

  this.emitStmtList(raw.body.body);
  u.v ? em++ : this.clear_onw();
  this.u();

  em && this.l();

  this.w('}');
  this.emc(cb, 'aft');
};
