Transformers['SequenceExpression'] =
function(n, isVal) {
  this.trList(n.expressions, isVal);
  return n;
};
