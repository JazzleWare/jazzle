this.calculateBaseSynthNames = function() {
  ASSERT.call(this, this.synthNamesUntilNow === null,
    'synthNamesUntilNow must be <null>');
  this.synthNamesUntilNow = new SortedObj();

  var list = this.defs, i = 0, len = list.length();
  while (i < len) {
    var elem = list.at(i++);
    this.synthDecl(elem);
  }
};


