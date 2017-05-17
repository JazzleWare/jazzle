transform['BinaryExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformBinaryExpressionWithYield(n, pushTarget, isVal);

  n.left = this.transform(n.left, null, true);
  n.right = this.transform(n.right, null, true);
  return n;
};
