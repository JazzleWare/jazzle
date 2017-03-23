transform['Program'] = function(n, list, isVal) {
  var b = n.body, i = 0;
  n.scope.synthesizeProgram(n.sourceType);
  this.scriptScope = n.scope;
  this.globalScope = this.scriptScope.parent;

  var ps = this.setScope(this.scriptScope);
  while (i < b.length) {
    b[i] = this.transform(b[i], null, false);
    i++;
  }
  this.setScope(ps);
  return n;
};
