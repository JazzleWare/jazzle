  import {ASSERT} from '../other/constants.js';
  import {_m} from '../other/scope-util.js';
  import SortedObj from '../SortedObj/cls.js';
  import {ATS_DISTINCT} from '../other/scope-constants.js';
  import {cls} from './cls.js';

cls.synth_boot =
function(r) {
  if (this.renamer === null) this.renamer = r;
  ASSERT.call(this, this.isSourceLevel(), 'script m');

  // TODO: source-level-scope.synthNamesUntilNow will be a 0-length SortedObj (because it has a synthBase other than itself),
  // yet because it gets recorded in rsList-s, it might be receiving queries like `locateSynth` (findSynth), etc., and this in turn requires
  // the value for its synthNamesUntilNow be non-null; this behaviour is somewhat hacky though, and it has got to be eliminated as soon as possible
  this.synth_boot_init(); 

  this.synth_defs_to(this.synthBase);
};

cls.synth_finish =
function() {
  this.synth_liquids_to(this.synthBase);
};

cls.synth_start =
function(r) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
};

cls.synth_liquids_to =
function(targetScope) {
  if (this.spThis !== null && this.spThis.ref.i)
    targetScope.synthLiquid(this.spThis);
  if (this.isAnyFn() && this.spArguments !== null) {
    if (this.spArguments.ref.i)
      targetScope.synthLiquid(this.spArguments);
    else {
      this.spArguments.synthName = this.spArguments.name;
      targetScope.insertSynth_m(_m(this.spArguments.name), this.spArguments);
    }
  }

  var list = this.liquidDefs, e = 0, len = list.length();
  while (e < len)
    this.synth_lg_to(list.at(e++), targetScope);
};

cls.synth_externals =
function() {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  var list = this.parent.defs, e = 0, len = list.length()  ;
  while (e < len)
    this.synthGlobal(list.at(e++));
};

cls.synth_lg_to =
function(lg, target) {
  var list = lg.list, e = 0;
  while (e < list.length)
    target.synthLiquid(list[e++]);
};

cls.synth_boot_init =
function() {
  ASSERT.call(this, this.isBootable(), 'not bootable');
  ASSERT.call(this, !this.isBooted, 'scope has been already booted'); 
  if (this.synthNamesUntilNow === null)
    this.synthNamesUntilNow = new SortedObj();
  this.isBooted = true;
};

cls.findSynth_m =
function(mname) {
  var sn = this.synthNamesUntilNow;
  return sn.has(mname) ? sn.get(mname) : null;
};

// can this name escape the current scope anyway?
// there is a difference between 'can' and 'do', of course -- a name could potentially escape a scope but still remain there because of a synth homonym.
// on the other hand, some names never escape a scope -- for example, an `arguments` never escapes an emitted function
cls.synth_ref_may_escape_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  return true;
};

// can this name get bound in the current scope anyway?
// there is a difference between being a valid binding name and being a valid binding -- any name that is not an `eval/arguments` (when strict) and is not reserved
// can be a valid binding name; but even then, they might remain invalid bindings, for example because they may be duplicates of an existing binding
cls.synth_name_is_valid_binding_m =
function(mname) { return true; };

cls.synth_ref_find_homonym_m =
function(mname, r) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

cls.synth_decl_find_homonym_m =
function(mname) {
  ASSERT.call(this, this.isSourceLevel(), 'script m');
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

cls.insertSynth_m =
function(mname, synth) {
  var sn = this.synthNamesUntilNow || 
    (this.synthNamesUntilNow = new SortedObj()); // for msynth which uses it before the scope is booted

  ASSERT.call(this, !sn.has(mname), '"'+mname+'" exists');
  return sn.set(mname, synth);
};

cls.synth_globals =
function(r) {
  this.synth_boot_init();
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'global/bundler' );
  ASSERT.call(this, this.renamer === null, 'renamer' );

  this.renamer = r;

  var list = this.defs, len = list.length(), l = 0;
  while (l < len)
    this.synthGlobal(list.at(l++));
};

cls.synthDecl =
function(decl) {
  ASSERT.call(this,
    decl.isFnArg() ||
    decl.isLet() ||
    decl.isConst() ||
    decl.isVar() ||
    decl.isCls() ||
    decl.isFn() ||
    (decl.isCatchArg() && decl.ref.scope.argIsSimple === false),
    'fun/let/const/var/fnarg'
  );

  ASSERT.call(this, decl.synthName === "", 'has synth');

  var rsList = decl.ref.rsList;
  var num = 0;
  var baseName = decl.name;
  var mname = "";
  var synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName); 
    var l = 0;
    var synth = null;

    while (l < rsList.length) {
      var scope = rsList[l++];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
      if (synth) {
        if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
          synth = synth.source;
        if (synth !== decl)
          continue RENAME;
      }
    }

    if (num === 0 && !this.synth_name_is_valid_binding_m(mname)) // shortcut: num === 0 (because currently no invalid name contains a number)
      continue RENAME;

    synth = this.synth_decl_find_homonym_m(mname, this.renamer);
    if (synth) {
      if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
        synth = synth.source;
      if (synth !== decl)
        continue RENAME;
    }

    break;
  } while (synthName = this.rename(baseName, ++num), true);

  decl.synthName = synthName;
  this.insertSynth_m(mname, decl);
};

cls.synthGlobal =
function(global) {
  ASSERT.call(this, this.isGlobal() || this.isBundle(), 'script m');
  ASSERT.call(this, global.isGlobal(), 'not g');
  if (!global.mustSynth()) {
    ASSERT.call(this, global.synthName === "", 'synth name');
    global.synthName = global.name;
    return;
  }
  var rsList = global.ref.rsList;
  var num = 0;
  var name = global.name;
  var synthNames = [name, ""]; // no rename(base, 0) -- this is a global

  var m = 0, mname = "";

  RENAME:
  do {
    while (m < synthNames.length) {
      mname = _m(synthNames[m++]);
      if (mname === _m("")) {
        ASSERT.call(this, num === 0, 'num');
        break RENAME;
      }
      var l = 0;
      while (l < rsList.length) {
        var scope = rsList[l++];
        if (!scope.synth_ref_may_escape_m(mname))
          continue RENAME;
        var synth = scope.synth_ref_find_homonym_m(mname, this.renamer);
        if (synth) {
          if (synth.isName() && synth.getAS() !== ATS_DISTINCT)
            synth = synth.source;
          if (synth !== global)
            continue RENAME;
        }
      }
    }

    break;
  } while (
    ++num,
    synthNames[0] = this.rename(name, num),
    synthNames[1] = synthNames[0] + "u",
    true
  );

  global.synthName = synthNames[0];

  this.insertSynth_m(_m(synthNames[0]), global);
  if (num > 0)
    this.insertSynth_m(_m(synthNames[1]), global /* TODO: s/global/null/ */);
};

cls.synthLiquid =
function(liquid) {
  ASSERT.call(this, liquid.isLiquid(), 'not liquid');
  ASSERT.call(this, liquid.synthName === "", 'has init');

  var rsList = liquid.ref.rsList;
  var num = 0;
  var baseName = liquid.name;
  var mname = "";
  var synthName = this.rename(baseName, num);

  RENAME:
  do {
    mname = _m(synthName);
    var l = 0;

    while (l < rsList.length) {
      var scope = rsList[l++ ];
      if (!scope.synth_ref_may_escape_m(mname))
        continue RENAME;

      if (scope.synth_ref_find_homonym_m(mname, this.renamer))
        continue RENAME;
    }

    if (!this.synth_name_is_valid_binding_m(mname))
      continue RENAME;

    if (this.synth_decl_find_homonym_m(mname, this.renamer))
      continue RENAME;

     break;
  } while (synthName = this.rename(baseName, ++num), true);

  liquid.synthName = synthName;
  this.insertSynth_m(mname, liquid );
};

cls.rename =
function(base, i) { return this.renamer(base, i); };


