Transformers['ThrowStatement'] =
function(n, isVal) {
  n.argument = this.tr(n.argument, true);
  return n;
};
