Transformers['ConditionalExpression'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  n.consequent = this.tr(n.consequent, isVal);
  n.alternate = this.tr(n.alternate, isVal);

  return n;
};
