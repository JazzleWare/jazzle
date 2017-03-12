transform['MemberExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformMemberExpressionWithYield(n, pushTarget, isVal);

  n.object = this.transform(n.object, null, true);
  if (n.computed)
    n.property = this.transform(n.property, null, true);

  return n;
};
