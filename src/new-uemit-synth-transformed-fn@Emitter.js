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
  this.wm(')','','{').i().onw(wcb_afterStmt);

  if (n.argsPrologue) {
    this.emitStmt(n.argsPrologue);
    this.emc(cb, 'inner');
  }

  var em = 0;
  this.wcb ? this.clear_onw() : em++;

  this.onw(wcb_afterStmt);
  this.emitStmtList(raw.body.body);

  this.u();
  this.wcb ? this.clear_onw() : em++;

  em && this.l();

  this.w('}');
  this.emc(cb, 'aft');
};
