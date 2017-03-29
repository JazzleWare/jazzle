this.calculateBaseSynthNames = function() {
  ASSERT.call(this, this.synthNamesUntilNow === null,
    'synthNamesUntilNow must be <null>');
  this.synthNamesUntilNow = new SortedObj();
  this.synthesizeNamesInto(this);
};


