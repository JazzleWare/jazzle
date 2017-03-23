this.synthsizeScript = function(sm) {
  this.calculateInitSynths(sm);
  if (sm === SM_EMIT)
    return;

  if (this.special.lexicalThis &&
    this.special.lexicalThis.ref.indirect !== 0)
    this.synthThis(this.special.lexicalThis);

  var argumentsDecl = this.findDecl('arguments');
  if (argumentsDecl && argumentsDecl.ref.indirect !== 0)
    this.synthSimple(argumentsDecl);
};

this.synthesize = function(sm) {
  if (this.isAnyFnBody())
    return this.synthesizeFn(sm);
  if (this.isModule())
    return this.synthsizeModule(sm);
  if (this.isScript())
    return this.synthesizeScript(sm);
  if (this.isBlock())
    return this.synthesizeBlock(sm);
  if (this.isBody()) {
    ASSERT.call(this, this.type === ST_BODY,
      'unexpected ' + this.typeString());
    return this.synthsizeSimpleBody(sm);
  }

  if (this.isClass())
    return this.synthesizeClass(sm);

  ASSERT.call(this, false,
    '<'+this.typeString()+'>?');
};
