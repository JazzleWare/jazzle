function base_Y0(n) {
  if (!this.scope.canYield() || n === null)
    return 0;
  switch (n.type) {
  case 'Identifier':
  case 'TemplateElement':
  case 'Literal':
  case 'DebuggerStatement':
  case 'ArrowFunctionExpression':
  case 'ThisExpression':
  case 'BreakStatement':
  case 'FunctionDeclaration':
  case 'EmptyStatement':
  case 'Super':
  case 'ContinueStatement':
  case 'FunctionExpression':
  case 'ExportAllDeclaration':
  case 'ExportDefaultDeclaration':
  case 'ExportNamedDeclaration':
  case 'ExportSpecifier':
  case 'ExpressionStatement':
  case 'ImportDeclaration':
  case 'ImportDefaultSpecifier':
  case 'ImportNamespaceSpecifier':
  case 'ImportSpecifier':
    return 0;
  }

  if (n.type === PAREN)
    return base_Y0.call(this, core(n));

  if (!HAS.call(n, '#y')) {
    console.error(n);
    throw new Error(n.type+'[#y]');
  }

  return n['#y'];
};

function base_Y(n) {
  ASSERT.call(this, n !== null, 'n');
  return base_Y0.call(this, n);
}

this.Y0 = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y0.call(this, arguments[e++]);
  return yc;
};

this.Y = function() {
  var yc = 0, e = 0;
  while (e < arguments.length)
    yc += base_Y.call(this, arguments[e++]);
  return yc;
};
