function y(n) {
  if (n === null)
    return 0;

  var y = yList[n.type].call(n);
  if (y === -1) return 0;
  return y;
}

var yList = {};

function yArray(n) {
  var e = 0, yArray = 0;
  while ( e < n.length )
    yArray += y(n[e++]);

  return yArray;
}

yList['LogicalExpression'] =
yList['AssignmentExpression'] =
yList['BinaryExpression'] =
yList['AssignmentPattern'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.left) + y(this.right); };
yList['ArrayPattern'] =
yList['ArrayExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.elements); };
yList['ForOfStatement'] =
yList['ForInStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.right) + y(this.left) + y(this.body); };
yList['DoWhileStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.body); };
yList['ForStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.init) + y(this.test) + y(this.update) + y(this.body); };
yList['IfStatement'] = 
yList['ConditionalExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.consequent) + y(this.alternate); };
yList['CallExpression'] =
yList['NewExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.callee) + yArray(this.arguments); };
yList['ClassDeclaration'] =
yList['ClassExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.superClass) + y(this.body); };
yList['CatchClause'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.param) + y(this.body); };
yList['BlockStatement'] = 
yList['ClassBody'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.body); };
yList['ThrowStatement'] =
yList['SpreadElement'] =
yList['ReturnStatement'] =
yList['RestElement'] =
yList['UnaryExpression'] =
yList['UpdateExpression'] =
  function() { return y(this.argument); };
yList['ObjectExpression'] =
yList['ObjectPattern'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.properties); };
yList['BreakStatement'] = 
yList['EmptyStatement'] = 
yList['ContinueStatement'] = 
yList['DebuggerStatement'] =
yList['Identifier'] = 
yList['Literal'] = 
yList['FunctionDeclaration'] =
yList['FunctionExpression'] =
yList['ArrowFunctionExpression'] =
yList['ThisExpression'] = 
yList['Super'] =
yList['TemplateElement'] =
  function() { return -1; };
yList['ExportAllDeclaration'] =
yList['ExportDefaultDeclaration'] =
yList['ExportNamedDeclaration'] =
yList['ExportSpecifier'] =
  function() { return -1; };
yList['ExpressionStatement'] =
  function() { return y(this.expression); };
yList['ImportDeclaration'] =
yList['ImportDefaultSpecifier'] =
yList['ImportNamespaceSpecifier'] =
yList['ImportSpecifier'] =
  function() { return -1; };
yList['SwitchCase'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + yArray(this.consequent); };
yList['SwitchStatement'] = 
  function() { return this.y !== -1 ? this.y : this.y = y(this.discriminant) + yArray(this.cases); };
yList['LabeledStatement'] =
  function() { return y(this.body); };
yList['MemberExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = this.computed ? y(this.object) + y(this.property) : y(this.object); };
yList['MetaProperty'] =
  function() { return -1; };
yList['Program'] = yList['BlockStatement']; 

function kv() { return this.y !== -1 ? this.y : this.y = this.computed ? y(this.key) + y(this.value) : y(this.value); }; 

yList['Property'] =
yList['AssignmentProperty'] = kv;
yList['MethodDefinition'] = kv;
yList['SequenceExpression'] = 
yList['TemplateLiteral'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.expressions); };
yList['TaggedTemplateExpression'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.tag) + y(this.quasi); };
yList['TryStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.block) + y(this.handler) + y(this.finalizer); };
yList['VariableDeclaration'] =
  function() { return this.y !== -1 ? this.y : this.y = yArray(this.declarations); };
yList['VariableDeclarator'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.id) + y(this.init); };
yList['WithStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.object) + y(this.body); }; 
yList['YieldExpression'] = 
  function() { return this.y !== -1 ? this.y : this.y = 1 + y(this.argument); };
yList['WhileStatement'] =
  function() { return this.y !== -1 ? this.y : this.y = y(this.test) + y(this.body); };
