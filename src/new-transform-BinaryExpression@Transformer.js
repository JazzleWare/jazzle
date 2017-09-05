Transformers['LogicalExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  var cvtz = this.setCVTZ(createObj(this.cvtz));
  n.right = this.tr(n.right, true);
  this.setCVTZ(cvtz );
  return n;
};

Transformers['BinaryExpression'] =
function(n, isVal) {
  n.left = this.tr(n.left, true);
  n.right = this.tr(n.right, true);
  return n;
};
