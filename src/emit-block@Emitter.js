this.emitDependentStmt = function(n, isElse) {
  if (n.type === 'BlockStatement')
    this.s().emitBlock(n, PREC_NONE, EC_NONE);
  else if (isElse && n.type === 'IfStatement')
    this.s().emitIf(n);
  else
    this.i().l().eA(n, PREC_NONE, EC_NONE).u();
};

Emitters['BlockStatement'] =
this.emitBlock = function(n, prec, flags) {
  this.w('{');
  var list = n.body;
  if (list.length > 0) {
    this.i();
    var i = 0;
    while (i < list.length) {
      this.l().emitAny(list[i], true, EC_START_STMT);
      i++;
    }
    this.u().l();
  }
  this.w('}');
};
