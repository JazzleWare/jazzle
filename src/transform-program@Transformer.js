transform['Program'] = function(n, list, isVal) {
  var b = n.body, i = 0;
  this.scriptScope = n.scope;
  this.globalScope = this.scriptScope.parent;

  var ps = this.setScope(this.scriptScope);
  var ts = this.setTempStack([]);

  this.currentScope.synthGlobals();
  this.currentScope.startupSynthesis();

  while (i < b.length) {
    b[i] = this.transform(b[i], null, false);
    i++;
  }
  this.currentScope.endSynthesis();

  this.setScope(ps);
  this.setTempStack(ts);

  return n;
};
