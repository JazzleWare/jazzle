Emitters['FunctionDeclaration'] = function(n, prec, flags) {
  if (n.generator)
    return this.emitGenerator(n, prec, flags);

  var paren = false;
  if (n.type === 'FunctionExpression')
    paren = flags & EC_START_STMT;
  if (paren) this.w('(');

  this.w('function');
  if (n.id) { this.w(' ').writeIdentifierName(n.id.name); }
  this.w('(');
  if (!functionHasNonSimpleParams(n))
    this.emitParams(n.params);
  this.wm(')',' ').emitFuncBody(n);
  if (paren) this.w(')');
};

this.emitParams = function(list) {
  var i = 0;
  while (i < list.length) {
    if (i) this.wm(',',' ');
    var elem = list[i];
    ASSERT.call(this, elem.type === 'Identifier',
      '<'+elem.type+'> is not a valid type for a parameter during the emit phase');
    this.writeIdentifierName(elem.name);
    i++;
  }
};

this.emitFuncBody = function(n) {
  var body = n.body.body, i = 0;
  this.w('{').i();
  while (i < body.length) {
    var elem = body[i];
    if (elem.type !== 'ExpressionStatement' ||
        elem.expression.type !== 'Literal' ||
        typeof elem.expression.value !== STRING_TYPE)
      break;
    this.l();
    this.emitAny(elem, true, EC_START_STMT);
    i++;
  }

  if (n.argumentPrologue)
    this.l().emitAny(n.argumentPrologue, true, EC_START_STMT);

  while (i < body.length) {
    this.l();
    this.emitAny(body[i++], true, EC_START_STMT);
  }

  this.u();
  if (i || n.argumentPrologue) 
    this.l();

  this.w('}');
};
