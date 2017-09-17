Transformers['ThrowStatement'] =
function(n, isVal) {
  var ais = this.setAS(true);
  this.incNS();
  n.argument = this.tr(n.argument, true);
  this.setAS(ais);
  return n;
};
