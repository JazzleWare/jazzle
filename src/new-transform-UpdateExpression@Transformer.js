Transformers['UpdateExpression'] =
function(n, isVal) {
  var arg = this.trSAT(n.argument);
  n.argument = arg;
  isResolvedName(arg) && arg.target.ref.assigned();

  return n;
};
