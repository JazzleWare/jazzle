this.bootSynthesis = function() {
  ASSERT.call(this, this.isConcrete(),
    'only concrete scope are allowed to be synth-booted');

  if (this.synthNamesUntilNow)
    return;

  this.synthNamesUntilNow = new SortedObj();
  var list = this.defs, i = 0, len = list.length();
  while (i < len) {
    var decl = list.at(i++);
    this.synthDecl(decl);
  }
};
