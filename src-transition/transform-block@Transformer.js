transform['BlockStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformBlockStatementWithYield(n, pushTarget, isVal);

  var ps = null;
  if (n.scope) {
    ps = this.setScope(n.scope);
    this.currentScope.synthesizeNamesInto(this.currentScope.scs);
  }

  var list = n.body, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], pushTarget, isVal);
    i++;
  }
  ps && this.setScope(ps);

  return n;
};
