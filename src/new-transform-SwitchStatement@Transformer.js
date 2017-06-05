Transformers['SwitchStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n. discriminant = this.tr(n.discriminant, true);
  this.trList(n.cases, false);
  return n;
};

Transformers['SwitchCase'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  if (n.test !== null)
    n.test = this.tr(n.test, true);
  this.trList(n.consequent, false);
  return n;
};
