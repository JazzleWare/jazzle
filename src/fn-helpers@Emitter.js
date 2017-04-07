this.emitFn = function(n, fnName, flags) {
  var paren = false,
      loopLexicals = this.getLoopLexicalRefList(n.scope);

  if (loopLexicals) paren = flags & EC_NEW_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }

  loopLexicals && this.writeClosureHead(loopLexicals);
  this.emitRawFn(n, fnName);
  loopLexicals && this.writeClosureTail(loopLexicals);

  paren && this.w(')');
};

this.getLoopLexicalRefList = function(scope) {
  var loopLexicals = null;
  ASSERT.call(this, scope.isAnyFnBody(),
    'fnbody was actually expected to extract poosible loop lexical names from');

  var head = scope.funcHead,
      list = head.refs,
      len = list.length(),
      e = 0;

  while (e < len) {
    var elem = list.at(e++);
    if (head.hasSignificantRef(elem)) {
      var decl = elem.getDecl();
      if (!decl.isLexical() || !decl.ref.scope.insideLoop())
        continue;
      if (!loopLexicals) loopLexicals = [];
      loopLexicals.push(elem.getDecl());
    }
  }

  return loopLexicals;
};
  
this.emitRawFn = function(n, fnName) {
  this.wm('function').s().w(fnName).w('(');
  if (!functionHasNonSimpleParams(n))
    this.emitParams(n.params);
  this.wm(')',' ').emitFuncBody(n);
};

this.writeClosureTail = function(loopLexicals) {
  this.wm('}','(');
  var e = 0;
  if (loopLexicals)
    while (e < loopLexicals.length) {
      e && this.wm(',',' ');
      this.w(loopLexicals[e++].synthName);
    }
  this.w(')');
};

this.writeClosureHead = function(loopLexicals) {
  this.wm('function','(');
  var e = 0;
  if (loopLexicals)
    while (e < loopLexicals.length) {
      e && this.wm(',',' ');
      this.w(loopLexicals[e++].synthName);
    }
  this.wm(')',' ','{');
};
