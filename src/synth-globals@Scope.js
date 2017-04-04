this.synthGlobals = function() {
  ASSERT.call(this, this.isScript() || this.isModule(),
    'globals are not allowed to be synthesized in any other scope than a script or a module');

  var globalScope = this.parent;
  ASSERT.call(this, globalScope.isGlobal(),
    'the script scope must have a global parent');

  var list = globalScope.defs, i = 0, len = list.length();
  while (i < len) {
    var globalDef = list.at(i++);
    var synthName = Scope.newSynthName(globalDef.name, null, globalDef.ref.lors);
    if (synthName === globalDef.name) {
      globalDef.setSynthName(synthName);
      this.trackSynthName(synthName);
    }
    else {
      globalDef.synthName = '<global>';
      this.getThis().liquid.updateCRSList(globalDef.ref.lors);
    }
  }
};

