this.inferName =
function(left, right, isComputed) {
  if (isComputed && left.type === 'Identifier')
    return null;

  var t = DT_NONE, c = false;
  switch (right.type) {
  case 'ArrowFunctionExpression':
    t = DT_FN;
    break;
  case 'FunctionExpression':
    if (right.id) return null;
    t = DT_FN;
    break;
  case 'ClassExpression':
    if (right.id)
      return null;
    t = DT_CLS; c = true;
    break; 

  default: return null
  }

  var scope = right['#scope'];
  t |= DT_INFERRED;
  var name = "";

  name = getIDName(left);
  if (name === "")
    return null;

  var scopeName = null;
  scopeName = scope.setName(name, null).t(t);
  scopeName.site = left;
  scopeName.synthName = scopeName.name;

  if (c && right['#ct'] !== null) this.inferName(left, right['#ct'].value, false);

  return scopeName;
};

this.cutEx =
function() {
  var ex = this.ex;
  this.ex = DT_NONE;
  return ex;
};
