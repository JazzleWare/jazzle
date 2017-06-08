this.synth_boot =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.synth_boot_init();
  this.synth_externals_to(null);
  this.synth_defs_to(this);
};

this.synth_finish =
function() {
  this.synth_liquids_to(this);
};

this.synth_start =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted() || this.synth_boot();
};

this.synth_liquids_to =
function(targetScope) {
  var list = this.liquidDefs, e = 0, len = list.length();
  while (e < len)
    this.synth_lg_to(list.at(e++), targetScope);
};

this.synth_externals_to =
function(targetScope) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  ASSERT.call(this, targetScope === null, 'null');
  var list = this.parent.defs, e = 0, len = list.length();
  while (e < len)
    this.synthGlobal(list.at(e++));
};

this.synth_lg_to =
function(lg, target) {
  var list = lg.list, e = 0;
  while (e < list.length)
    target.synthLiquid(list[e++]);
};

this.synth_boot_init =
function() {
  ASSERT.call(this, this.isBootable(), 'not bootable');
  ASSERT.call(this, !this.isBooted(), 'scope has been already booted'); 
  this.synthNamesUntilNow = new SortedObj();
};

this.findSynth_m =
function(mname) {
  var sn = this.synthNamesUntilNow;
  return sn.has(mname) ? sn.get(mname) : null;
};

// can this name escape the current scope anyway?
// there is a difference between 'can' and 'do', of course -- a name could potentially escape a scope but still remain there because of a synth homonym.
// on the other hand, some names never escape a scope -- for example, an `arguments` never escapes an emitted function
this.synth_ref_may_escape_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  return true;
};

// can this name get bound in the current scope anyway?
// there is a difference between being a valid binding name and being a valid binding -- any name that is not an `eval/arguments` (when strict) and is not reserved
// can be a valid binding name; but even then, they might remain invalid bindings, for example because they may be duplicates of an existing binding
this.synth_name_is_valid_binding_m =
function(mname) { return true; };

this.synth_ref_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted() || this.synth_boot();
  return this.findSynth_m(mname);
};

this.synth_decl_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted() || this.synth_boot();
  return this.findSynth_m(mname);
};

this.insertSynth_m =
function(mname, synth) {
  var sn = this.synthNamesUntilNow;
  ASSERT.call(this, !sn.has(mname), '"'+mname+'" exists');
  return sn.set(mname, synth);
};

this.synthDecl =
function(decl) {
  ASSERT.call(this,
    decl.isFn() ||
    decl.isLet() ||
    decl.isConst() ||
    decl.isVar() ||
    decl.isFnArg(),
    'fun/let/const/var/fnarg'
  );

  ASSERT.call(this, decl.synthName === "", 'has synth');

  var rsList = decl.ref.rsList;
  var num = 0;
  var baseName = decl.name;
  var mname = "";
  var synthName = baseName;

  RENAME:
  do {
    mname = _m(synthName); 
    var l = 0;
    var synth = null;

    while (l < rsList.length) {
      var scope = rsList[l++];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname);
      if (synth && synth !== decl)
        continue RENAME;
    }

    if (num === 0 && !this.synth_name_is_valid_binding_m(mname)) // shortcut: num === 0 (because currently no invalid name contains a number)
      continue RENAME;

    synth = this.synth_decl_find_homonym_m(mname);
    if (synth) {
      if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
        synth = synth.source;
      if (synth !== decl)
        continue RENAME;
    }

    break;
  } while (synthName = baseName + "" + (num+=1), true);

  decl.synthName = synthName;
  this.insertSynth_m(mname, decl);
};

this.synthGlobal =
function(global) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  ASSERT.call(this, global.isGlobal(), 'not g');

  var rsList = global.ref.rsList;
  var original = true;
  var name = global.name;
  var mname = _m(name);

  var l = 0;
  while (l < rsList.length) {
    var scope = rsList[l++];
    if (!scope.synth_ref_may_escape(mname)) { original = false; break; }
    var synth = scope.synth_ref_find_homonym_m(mname);
    if (synth) {
      if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
        synth = synth.source;
      if (synth !== global) { original = false; break; }
    }
  }

  if (original) {
    global.synthName = name;
    this.insertSynth_m(mname, global);
  } else {
    var thisL = this.spThis || this.spCreate_this(null);
    var l = 0;
    while (l < rsList.length)
      thisL.track(rsList[l++]);
  }
};

this.synthLiquid =
function(liquid) {
  ASSERT.call(this, liquid.isLiquid(), 'not liquid');
  ASSERT.call(this, liquid.synthName === "", 'has init');

  var rsList = liquid.ref.rsList;
  var num = 0;
  var baseName = liquid.name;
  var mname = "";
  var synthName = baseName;

  RENAME:
  do {
    mname = _m(synthName);
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      if (scope.synth_ref_find_homonym_m(mname))
        continue RENAME;
    }

    if (!this.synth_name_is_valid_binding_m(mname))
      continue RENAME;

    if (this.synth_decl_find_homonym_m(mname))
      continue RENAME;

     break;
  } while (synthName = baseName + "" + (num+=1), true);

  liquid.synthName = synthName;
  this.insertSynth_m(mname, liquid );
};
