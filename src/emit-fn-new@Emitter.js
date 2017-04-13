Emitters['FunctionExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_START_STMT,
      altName = false,
      scopeName = n.scope.funcHead.scopeName;

  if (scopeName && scopeName.name !== scopeName.synthName)
    altName = true;

  var loopLexicals = n.scope.getLoopLexicalRefList();

  if (altName || loopLexicals) {
    if (!paren) paren = flags & EC_NEW_HEAD;
  }

  if (paren) { this.w('('); flags = EC_NONE; }

  if (altName || loopLexicals) {
    this.writeClosureHead(loopLexicals);
    if (altName) {
      this.i().l().wm('var',' ',scopeName.synthName,' ','=',' ');
      this.emitRawFn(n, scopeName.name);
      this.w(';').l().wm('return',' ',scopeName.synthName,';').u().l();
    }
    else {
      this.i().l().wm('return',' ').emitRawFn(n, scopeName.name);
      this.u().l();
    }
    this.writeClosureTail(loopLexicals);
  }
  else this.emitRawFn(n, scopeName ? scopeName.name : "");

  paren && this.w(')');
};
