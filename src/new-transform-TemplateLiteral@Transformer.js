Transformers['TemplateLiteral'] =
function(n, isVal) {
  var list = n.expressions, l = 0;
  while (l < list.length) {
    var item = list[l];
    list[l] = this.tr(item, true);
    l++;
  }
  return n;
};
