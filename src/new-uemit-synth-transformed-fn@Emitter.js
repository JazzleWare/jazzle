UntransformedEmitters['transformed-fn'] =
function(n, flags, isStmt) {
  return n.target ?
    this.emitDeclFn(n, flags, isStmt) :
    this.emitExprFn(n, flags, isStmt);
};

this.emitTransformedFn =
function(n, flags, isStmt) {
  this.wm('function');
  var raw = n.fun;
  var scopeName = raw['#scope'].scopeName;
  if (scopeName) {
    this.s();
    this.writeIDName(scopeName.name);
  }
  this.w('(');

  if (raw.params)
    this.emitCommaList(raw.params);
  this.wm(')',' ','{').i().onW(onW_line);

  if (n.argsPrologue)
    this.eA(n.argsPrologue, EC_START_STMT, true);

  var em = 0;
  if (this.hasOnW())
    this.clearOnW();

  this.onW(onW_line);
  this.emitStmtList(raw.body.body);

  this.u();
  this.hasOnW() ? this.clearOnW() : this.l();
  this.w('}');
};
