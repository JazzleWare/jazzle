this.synthesizeLiquids = function() {
  var list = this.liquidRefs, i = 0, len = this.liquidRefs.length();
  while (i < len)
    this.trackSynthName(list.at(i++).synthName);

  list = this.synthLiquids, i = 0, len = this.synthLiquids.length();
  while (i < len)
    this.synthesizeDecl(list.at(i++));
};
