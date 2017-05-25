Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var list = n.body, e = 0;
  while (e < list.length) {
    list[e] = this.tr(list[e], false);
    e++;
  }
  return n;
};
