Transformers['LogicalExpression'] = Transformers['BinaryExpression'] =
function(n, ownerList, isVal) {
  n.left = this.tr(n.left, true);
  n.right = this.tr(n.right, true);
  return n;
};
