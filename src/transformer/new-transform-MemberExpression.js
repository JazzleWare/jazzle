Transformers['MemberExpression'] =
function(n, isVal) {
  n.object = this.tr(n.object, true);
  if (n.computed) n.property = this.tr(n.property, true);
  return n;
};

this.trSAT_mem = Transformers['MemberExpression'];
