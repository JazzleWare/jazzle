transform['WhileStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformWhileStatementWithYield(n, pushTarget, isVal);

  n.test = this.transform(n.test, null, false);
  n.body = this.transform(n.body, null, false);
  return n;
};
