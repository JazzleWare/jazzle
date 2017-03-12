transform['CallExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformCallExpressionWithYield(n, pushhTarget, isVal);

  n.callee = this.transform(n.callee, null, true);

  var list = n.arguments, i = 0;
  while (i < list.length) {
    list[i] = this.transform(list[i], null, true);
    i++;
  }

  return n;
};
