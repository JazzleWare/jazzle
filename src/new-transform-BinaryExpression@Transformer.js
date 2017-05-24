TransformerList['BinaryExpression'] =
function(n, ownerList, isVal) {
  n.left = this.tr(n.left, null, true);
  n.right = this.tr(n.right, null, true);
  return n;
};
