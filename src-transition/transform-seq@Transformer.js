transform['SequenceExpression'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformSequenceExpressionWithYield(n, pushTarget, isVal);

  var list = n.expressions, i = 0;
  while (i < list.length) {
    list[i] = this.tr(list[i], null, true);
    i++;
  }

  return n;
};
