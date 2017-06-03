UntransformedEmitters['resolved-name'] =
function(n, flags, isStmt) {
  var str = n.target.ref.scope.scopeID+':'+n.target.name;
  str += '#['+n.target.synthName+']';
  if (n.tz) str += '::tz';
  this.w(str);
  isStmt && this.w(';');
  return true;
};

this.emitSAT_resolvedName = UntransformedEmitters['resolved-name'];
