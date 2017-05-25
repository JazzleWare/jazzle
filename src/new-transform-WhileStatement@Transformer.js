Transformers['WhileStatement'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  n.body = this.tr(n.body, false);
  return n;
};
