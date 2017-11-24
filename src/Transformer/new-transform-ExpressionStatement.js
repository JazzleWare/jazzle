
Transformers['ExpressionStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  n.expression = this.tr(n.expression, false);
  return n;
};

