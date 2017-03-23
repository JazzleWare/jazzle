this.synthesizeProgram = function(sourceType) {
  ASSERT.call(this, sourceType !== 'module',
    'synthesizing modules scopes is not currently supported');
  var list = this.defs, i = 0, len = list.length;
  while (i < len) {
    var decl = list.at(i++);
    if (decl.name === 'arguments')
      continue;
    this.synthesizeDecl(decl);
  }

  var argumentsDecl = this.findDecl('arguments');
  if (argumentsDecl && argumentsDecl.ref.indirect)
    this.synthesizeDecl(argumentsDecl);

  var thisDecl = this.special.lexicalThis;
  if (thisDecl && thisDecl.ref.indirect)
    this.synthesizeDecl(thisDecl);
};
