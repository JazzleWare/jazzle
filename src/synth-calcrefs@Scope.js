this.calculateRefs = function() {
  var list = this.refs, i = 0, len = list.length(), decl = null;
  while (i < len) {
    var elem = list.at(i++);
    var resolved = elem.resolved;
    if (!resolved & this.isAnyFnBody()) {
      decl = elem.getDecl();
      if (decl === this.funcHead.scopeName)
        resolved = true;
    }
    if (resolved) {
      var decl = elem.getDecl();
      ASSERT.call(this, decl.synthName !== "",
        'all outer references are expected to have been synthesized upon entering a scope');
      ASSERT.call(this, !this.containsSynthName(decl.synthName),
        'a synth ref is colliding with a synth decl -- but how come?');
      this.trackSynthName(decl.synthName);
    }
  }
};
