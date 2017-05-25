Transformers['DoWhileStatement'] =
function(n, isVal) {
  n.body = this.tr(n.body, false);
  n.test = this.tr(n.test, true);
  return n;
};
