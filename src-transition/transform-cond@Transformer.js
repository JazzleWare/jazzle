transform['ConditionalExpression'] = function(n, list, isVal) {
  if (this.y(n))
    return this.transformConditionalExpressionWithYield(n, list, isVal);

  n.test = this.tr(n.test, null, true);
  n.consequent = this.tr(n.consequent, null, true);
  n.alternate = this.tr(n.alternate, null, true);
  return n;
};

this.transformConditionalExpressionWithYield = function(n, list, isVal) {
  n.test = this.transform(n.test, list, true);
  var ifBody = [], elseBody = [];
      t = null;
  n.consequent = this.tr(n.consequent, ifBody, isVal);
  if (isVal) {
    t = this.save(n.consequent, ifBody);
    this.rl(t);
  }
  n.alternate = this.tr(n.alternate, elseBody, isVal);
  if (isVal) {
    t = this.save(n.alternate, elseBody);
    this.rl(t);
  }
  push_checked(synth_if(n.test, ifBody, elseBody), list);
  return isVal ? t : NOEXPR;
};

