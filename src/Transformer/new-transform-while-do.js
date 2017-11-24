
Transformers['DoWhileStatement'] =
function(n, isVal) {
  var w = n['#scope'];
  var s = this.setScope(w);
  n.body = this.tr(n.body, false);
  this.setScope(s);
  n.test = this.tr(n.test, true);

  return n;
};

