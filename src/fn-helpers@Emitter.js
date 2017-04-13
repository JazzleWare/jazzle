this.emitFn = function(n, fnName, flags) {
  var paren = false,
      loopLexicals = n.scope.getLoopLexicalRefList();

  if (loopLexicals) paren = flags & EC_NEW_HEAD;
  if (paren) { this.w('('); flags = EC_NONE; }

  loopLexicals && this.writeClosureHead(loopLexicals);
  this.emitRawFn(n, fnName);
  loopLexicals && this.writeClosureTail(loopLexicals);

  paren && this.w(')');
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

this.emitRawFn = function(n, fnName) {
  this.wm('function').s().w(fnName).w('(');
  if (!functionHasNonSimpleParams(n))
    this.emitParams(n.params);
  this.wm(')',' ').emitFuncBody(n);
};
