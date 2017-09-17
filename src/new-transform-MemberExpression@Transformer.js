Transformers['MemberExpression'] =
function(n, isVal) {
  var ais = this.setAS(true);
  n.object = this.tr(n.object, true);
  if (n.computed) n.property = this.tr(n.property, true);
  this.setAS(ais);
  return n;
};

this.trSAT_mem = Transformers['MemberExpression'];
