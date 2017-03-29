this.synthesizeNamesInto = function(scs) {
  ASSERT.call(this, scs.isConcrete(),
    'synthesis target has to be a concrete scope');

  var list = this.defs, i = 0, len = list.length();
  while (i < len) {
    var elem = list.at(i++);
    if (elem.ref.scope === this)
      scs.synthDecl(elem);
    else
      ASSERT.call(this, elem.ref.scope === this.scs,
        'any decl in a scope must either belong to the scope itself or the surrounding concrete scope');
  }

};

this.synthesizeLiquidsInto = function(scs) {
  ASSERT.call(this, scs.isConcrete(),
    'synthesis target has to be a concrete scope');
  var list = this.liquidDefs, i = 0, len = list.length();
  while (i < len)
    scs.synthLiquid(list.at(i++));
};

this.synthLiquid = function(liquid) {
  ASSERT.call(this, liquid.synthName === "",
    'this liquid has already got a synth-name');
  var baseName = liquid.idealName;
  if (baseName === "") {
    baseName = liquid.name;
    if (baseName === "")
      baseName = "lq";
  }

  var synthName = Scope.newSynthName(baseName, this, liquid.crsList);
  liquid.setSynthName(synthName);
  this.trackSynthName(synthName);
};

this.synthDecl = function(decl) {
  ASSERT.call(this, decl.synthName === "",
    'this decl has already got a synth-name');
  var baseName = decl.name;
  ASSERT.call(this, baseName !== "",
    'the decl has to have a name');
  var synthName = Scope.newSynthName(baseName, this, decl.ref.lors);
  decl.setSynthName(synthName);
  this.trackSynthName(synthName);
};

this.containsSynthName = function(name) {
  return this.containsSynthName_m(_m(name));
};

this.containsSynthName_m = function(mname) {
  return this.synthNamesUntilNow.has(mname);
};

this.trackSynthName = function(name) {
  return this.trackSynthName_m(_m(name));
};

this.trackSynthName_m = function(mname) {
  ASSERT.call(this, !this.synthNamesUntilNow.has(mname),
    'a name that already exists can not be tracked: <' + _u(mname) + '>');
  this.synthNamesUntilNow.set(mname, true);
};
