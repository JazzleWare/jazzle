Transformers['ObjectExpression'] =
function(n, isVal) {
  var list = n.properties, e = 0;
  while (e < list.length) {
    var elem = list[e++];
    if (elem.computed)
      elem.key = this.tr(elem.key, true);
    elem.value = this.tr(elem.value, true);
  }
  return n;
};
