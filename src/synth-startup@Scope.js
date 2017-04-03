this.startupSynthesis = function() {
  ASSERT.call(
    this,
    this.isConcrete(),
    'only concrete scopes are allowed to have a synth-starup'
  );
  this.bootSynthesis();

  var list = this.refs, i = 0, len = list.length(), elem = null;
  while (i < len) {
    var elem = list.at(i++);
    if (!this.hasSignificantRef(elem))
      continue;
    this.trackSynthName(elem.getDecl().synthName);
  }
};
