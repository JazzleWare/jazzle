Transformers['ForOfStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#scope']), t = null;

  switch (n.left.type) {
  case 'MemberExpression':
  case 'Identifier':
    break;

  case 'VariableDeclaration':
    var l = n.left;
    if (false);
  }
};
