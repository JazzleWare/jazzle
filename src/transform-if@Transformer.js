transform['IfStatement'] = function(n, pushTarget, isVal) {
  if (this.y(n))
    return this.transformIfStatementWithYield(n, pushTarget, isVal);
  
  n.test = this.tr(n.test, null, true);
  n.consequent = this.tr(n.consequent, null, false);
  if (n.alternate)
    n.alternate = this.tr(n.alternate, null, false);
  return n;
};
