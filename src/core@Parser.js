this.inferName =
function(left, right, isComputed) {
  if (isComputed && left.type === 'Identifier')
    return null;
  switch (right.type) {
  case 'ArrowFunctionExpression':
    break;
  case 'FunctionDeclaration':
  case 'FunctionExpression':
    if (right.id)
      return null;
    break;

  default: return null
  }

  var scope = right['#scope'];
  var t = DT_FN|DT_INFERRED;
  var name = "";

  name = getIDName(left);
  if (name === "")
    return null;

  var scopeName = null;
  scopeName = scope.setName(name, null).t(t);
  scopeName.synthName = scopeName.name;
  
  return scopeName;
};

this.cutEx =
function() {
  var ex = this.ex;
  this.ex = DT_NONE;
  return ex;
};
