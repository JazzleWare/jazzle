this.calculateRefs = function() {
  var list = this.refs, i = 0, len = list.length();
  while (i < len) {
    var elem = list.at(i++);
    if (!elem.resolved) {
      var decl = elem.getDecl();
      ASSERT.call(this, decl.synthName !== "",
        'all outer references are expected to have been synthesized upon entering a scope');
      ASSERT.call(this, !this.containsSynthName(decl.synthName),
        'a synth ref is colliding with a synth decl -- but how come?');
      this.trackSynthName(decl.synthName);
    }
  }
};
