
Transformers['SpreadElement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, true);
  n.argument = this.tr(n.argument, isVal);
  return n;
};

