this.endSynthesis = function() {
  ASSERT.call(this, this.funcHead.liquidDefs === null,
    'fn head is not allowed to have a liquid def-list');

  var list = this.liquidDefs, i = 0, len = list.length();
  while (i < len)
    this.synthLiquid(list.at(i++));
};
