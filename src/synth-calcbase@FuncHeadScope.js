this.calculateBaseSynthNames = function() {
  ASSERT.call(this, this.synthNamesUntilNow === null,
    'synthNamesUntilNow must be <null>');
  this.synthNamesUntilNow = new SortedObj();

  var list = this.paramList,
      i = 0,
      len = list.length,
      elem = null;

  var alreadySynthesized = {};
  while (i < len) {
    elem = list[i++];
    var mname = _m(elem.name);
    if (HAS.call(alreadySynthesized, mname))
      continue;
    this.synthDecl(elem);
    alreadySynthesized[mname] = true;
  }

  list = this.defs, i = 0, len = list.length();
  while (i < len) {
    elem = list.at(i++);
    this.synthDecl(elem);
  }
};
