this.synth_boot =
function(r) {
  ASSERT.call(this, !this.isBooted, 'boot' );
  if (this.renamer === null) this.renamer = r;
  this.synth_boot_init();
  if (this.argIsSignificant)
    this.synthRealCatchVar();
  else
    this.catchVar = new Liquid('catchname').n('t');
  this.synth_defs_to(this.scs);
};

this.synth_boot_init =
function() {
  ASSERT.call(this, !this.isBooted, 'boot' );
  ASSERT.call(this, this.synthNamesUntilNow === null, 'sn' );
  this.synthNamesUntilNow = new SortedObj();
  this.isBooted = true;
};

this.synth_start =
function(r) {
  this.isBooted || this.synth_boot(r);

  FunScope.prototype.synth_externals.call(this);
};

this.synth_ref_may_escape_m =
function(mname) { return true; };

this.insertSynth_m = ConcreteScope.prototype.insertSynth_m;
this.rename = ConcreteScope.prototype.rename;

this.synth_ref_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.findSynth_m = ConcreteScope.prototype.findSynth_m;

this.synth_rcv =
function() {
  ASSERT.call(this, cv.isCatchArg(), 'catch' );
  var cv = this.defs.at(0), list = cv.ref.rsList, num = 0;
  var baseName = c.name, synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName);
    var synth = null;
    var l = 0;
    while (l < list.length) {
      var scope = list[l++];
      if (!scope.synth_ref_may_escape_m(mname, this.renamer))
        continue RENAME;
      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth && synth !== c)
        continue RENAME;
    }
    break;
  } while (synthName = this.rename(baseName, ++num), true );

  c.synthName = synthName;
  this.insertSynth_m(mname, c);
};


