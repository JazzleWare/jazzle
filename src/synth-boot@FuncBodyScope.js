this.bootSynthesis = function() {
  if (this.synthNamesUntilNow)
    return;

  this.synthNamesUntilNow = new SortedObj();

  var list = this.funcHead.paramList,
      i = 0,
      elem = null,
      alreadyUsed = {},
      len = list.length;

  while (i < len) {
    elem = list[i++];
    if (HAS.call(alreadyUsed, _m(elem.name)))
      continue;

    this.synthDecl(elem);
    alreadyUsed[_m(elem.name)] = true;
  }

  list = this.defs, i = 0, len = list.length();
  while (i < len) {
    elem = list.at(i++);
    ASSERT.call(
      this,
      !HAS.call(this.funcHead.paramMap, _m(elem.name)),
      'arg list should not have anything in common with var list'
    );
    this.synthDecl(elem);
  } 
};
