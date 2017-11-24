
Transformers['ArrayExpression'] =
function(n, isVal) {
  this.trList(n.elements, true );
  return n;
};

