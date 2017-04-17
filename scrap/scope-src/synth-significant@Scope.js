this.hasSignificantRef = function(ref) {
  ASSERT.call(this, this.isScript() || this.isModule(),
    'a scope or module scope was expected but got a <'+this.typeString()+'>');
  if (ref.resolved)
    return false;

  var decl = ref.getDecl();
  if (decl.isActuallyLiquid())
    return false;

  if (decl.isInsignificant())
    return false;

  ASSERT.call(this, decl.isGlobal(),
    'the only kind of external reference in a script is global scope');

  if (decl.synthName === decl.name)
    return true;

  ASSERT.call(this, decl.synthName === '<global>',
    'synthesized globals whose synthesized names are not the same as their real names '+
    'must have been named <global>'
  );

  return false;
};
