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
  var body = n.body.body;
  this.w('{').i();

  var needsNL = true;
  var e = this.emitPrologue(body, true);
  needsNL = !e;

  needsNL = !this.emitTemps(n, needsNL);
  needsNL = !this.emitTZ(n, needsNL);
  needsNL = !this.emitThis(n, needsNL);
  needsNL = !this.emitArguments(n, needsNL);

  if (n.argumentPrologue)
    this.l().emitAny(n.argumentPrologue, true, EC_START_STMT);

  this.emitVars(n, true);
  this.emitFuncs(n, true);

  while (e < body.length) {
    this.l();
    this.emitAny(body[e++], true, EC_START_STMT);
  }

  this.u();
  if (e || n.argumentPrologue) 
    this.l();

  this.w('}');
};
