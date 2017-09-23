Transformers['NewExpression'] =
function(n, isVal) {
  var ais = this.setAS(true)
  n.callee = this.tr(n.callee, true);
  this.trList(n.arguments, true);
  this.setAS(ais);
  return n;
};
