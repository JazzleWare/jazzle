transform['ArgsPrologue'] = function(n, pushTarget, isVal) {
  var synthLeft = { type: 'ArrayPattern', elements: n.left, y: 0 };
  var synthAssig = { type: 'AssignmentExpression', left: synthLeft, right: n.right, y: 0 };
  var synthStmt = { type: 'ExpressionStatement', expression: synthAssig, y: 0 };
  return this.transform(synthStmt, null, false);
};
