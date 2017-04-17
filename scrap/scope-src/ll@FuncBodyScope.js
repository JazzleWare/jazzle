this.getLoopLexicalRefList = function() {
  var loopLexicals = null;
  ASSERT.call(this, this.isAnyFnBody(),
    'fnbody was actually expected to extract poosible loop lexical names from');

  var head = this.funcHead,
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
