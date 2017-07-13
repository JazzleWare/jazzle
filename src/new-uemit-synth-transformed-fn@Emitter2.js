UntransformedEmitters['transformed-fn'] =
function(n, flags, isStmt) {
  return n.target ?
    this.emitDeclFn(n, flags, isStmt) :
    this.emitExprFn(n, flags, isStmt);
};

this.emitTransformedFn =
function(n, flags, isStmt) {
  this.wt('function', ETK_ID );
  var raw = n.fun;
  var scopeName = raw['#scope'].scopeName;
  if (scopeName) {
    this.bs();
    this.writeIDName(scopeName.name);
  }
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
};
