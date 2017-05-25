Transformers['IfStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n.test = this.tr(n.test, true);
  n.consequent = this.tr(n.consequent, false);
  if (n.alternate)
    n.alternate = this.tr(n.alternate, false);
  return n;
};
