this.synthesizeLiquids = function() {
  var list = this.liquidRefs, i = 0, len = this.liquidRefs.length();
  while (i < len)
    this.trackSynthNameRef(list.at(i++).synthName);

  list = this.liquidDefs, i = 0, len = this.liquidDefs.length();
  while (i < len)
    this.synthesizeDecl(list.at(i++));
};

this.hasSynthName_m = function(mname) {
  ASSERT.call(this, this.isConcrete(),
    'only concrete scopes are allowed to be tested for having a synth name');
  return this.synthDefs.has(mname);
};

this.acceptsSynthName_m = function(mname) {
  ASSERT.call(this, this.isConcrete(),
    'only concrete scopes are allowed to tested for accepting a synth name');
  if (this.synthDefs === null)
    this.calculateBaseSynthNames();

  return !this.synthDefs.has(mname) &&
         !this.synthRefs.has(mname);
};

this.synthesizeDecl = function(decl) {
  ASSERT.call(this, this.isConcrete(),
    'only concrete scopes are allowed to synthesize a decl');
  ASSERT.call(this, decl.synthName === "",
    'this decl has already been synthesized as <'+decl.name+'->'+decl.synthName+'>');
  var synthName = this.newSimpleSynthName(decl.name, decl.ref.lors);
  decl.synthName = synthName;
  this.trackSynthNameDef(synthName);
};
  
this.calculateBaseSynthNames = function() {
  ASSERT.call(this, this.isConcrete(),
    'only concrete scopes are allowed to have a base synthname list');
  if (this.isScript() || this.isModule())
    this.calculateBaseSynthNames_script();
  else {
    ASSERT.call(this, this.isAnyFnBody(),
      'a fnbody was expected but got '+this.typeString());
    this.calculateBaseSynthNames_fnBody();
  }
};

this.calculateBaseSynthNames_script = function() {
  var list = this.defs, i = 0, len = list.length();
  var elem = null;
  this.synthDefs = new SortedObj();
  while (i < len) {
    elem = list.at(i++);
    this.synthDecl(elem);
  }
};
