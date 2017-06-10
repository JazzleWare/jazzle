this.clearPendingStrictErrors =
function() {
  if (this.ct === ERR_NONE_YET)
    return;

  ASSERT.call(this, this.ct === ERR_PIN_OCTAL_IN_STRICT,
    'the only strict error allowed currently is ERR_PIN_OCTAL_IN_STRICT');
  this.ct = ERR_NONE_YET;
};

this.inferName =
function(left, right, isComputed) {
  if (isComputed && left.type === 'Identifier')
    return null;
  if (right.type !== 'FunctionDeclaration' &&
    right.type !== 'FunctionExpression')
    return null;
  if (right.id)
    return null;

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
