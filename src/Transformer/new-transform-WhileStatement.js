
Transformers['WhileStatement'] =
function(n, isVal) {
  n.test = this.tr(n.test, true);
  var w = n['#scope'];
  var l = this.setScope(w);
  n.body = this.tr(n.body, false);

  this.setScope(l);

  return n;
};

