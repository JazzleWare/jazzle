
Transformers['LabeledStatement'] =
function(n, isVal) {
  n.body = this.tr(n.body, false );
  return n;
};

