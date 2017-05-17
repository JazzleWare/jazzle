transform['NewExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformNewExpressionWithYield(n, pushTarget, isVal);

  n.callee = this.transform(n.callee, pushTarget, true);

  var list = n.arguments, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], null, true);
    i++;
  }

  return n;
};
