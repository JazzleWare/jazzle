Transformers['UpdateExpression'] =
function(n, isVal) {
  n.argument = this.trSAT(n.argument);
  return n;
};
