function LexicalScope(sParent, sType) {
  Scope.call(this, sParent, sType);

  this.synthName = "";
  this.childBindings = null;
  
  var surroundingCatch =
    sParent.isCatchBody() ?
      sParent :
      sParent.isLexical() ?
        sParent.surroundingCatch :
        null;
}

