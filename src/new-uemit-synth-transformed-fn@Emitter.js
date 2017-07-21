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
    this.writeIDName(scopeName.name);
  }
  this.emc(cb, 'list.bef' );
  this.w('(');

  if (raw.params)
    this.emitCommaList(raw.params);
  this.wm(')','','{').i().onw(wcb_afterStmt);

  if (n.argsPrologue)
    this.emitStmt(n.argsPrologue);

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
