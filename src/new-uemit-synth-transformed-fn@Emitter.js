UntransformedEmitters['transformed-fn'] =
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
  this.wm(')',' ','{').i();

  var em = 0;
  var l0 = this.sc(""); // args
  if (n.argsPrologue)
    this.eA(n.argsPrologue, EC_START_STMT, true);
  l0 = this.sc(l0);
  if (l0.length) { ++em; this.l().w(l0); }

  l0 = this.sc("");
  this.emitStmtList(raw.body.body);
  l0 = this.sc(l0);
  if (l0.length) { ++em; this.l().w(l0); }

  this.u();
  em && this.l();
  this.w('}');
};
