this.endSynthesis = function() {
  ASSERT.call(this, this.isScript() || this.isModule(),
    'a script or module scope was expected but got '+this.typeString());

  var list = this.liquidDefs, i = 0, len = list.length();
  while (i < len)
    this.synthLiquid(list.at(i++));
};
