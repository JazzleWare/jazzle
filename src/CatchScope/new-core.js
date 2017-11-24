  import {ASSERT} from '../other/constants.js';
  import Liquid from '../Liquid/cls.js';
  import SortedObj from '../SortedObj/cls.js';
  import FunScope from '../FunScope/cls.js';
  import ConcreteScope from '../ConcreteScope/cls.js';
  import {_m} from '../other/scope-util.js';
  import {cls} from './cls.js';

this.synth_boot =
function(r) {
  ASSERT.call(this, !this.isBooted, 'boot' );
  if (this.renamer === null) this.renamer = r;
  this.synth_boot_init();
  if (this.argIsSignificant)
    this.synth_rcv();
  else
    this.catchVar = new Liquid('catchname').n('t');
  this.synth_defs_to(this.synthBase);
};

this.synth_boot_init =
function() {
  ASSERT.call(this, !this.isBooted, 'boot' );
  if (this.synthNamesUntilNow === null)
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

this.insertSynth_m = 
function(mname, synth) {
  return ConcreteScope.prototype.insertSynth_m.call(this, mname, synth);
};

this.rename =
function(base, n) { return ConcreteScope.prototype.rename.call(this, base, n); };

this.synth_ref_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};

this.findSynth_m =
function(mname) {
  return ConcreteScope.prototype.findSynth_m.call(this, mname);
};

this.synth_rcv =
function() {
  var c = this.defs.at(0), list = c.ref.rsList, num = 0;
  ASSERT.call(this, c.isCatchArg(), 'catch' );
  var baseName = c.name, synthName = this.rename(baseName, num);

  this.catchVar = c;

  RENAME:
  do {
    var mname = _m(synthName);
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

this.synth_lcv =
function() {
  var liq = this.catchVar;
  var baseName = liq.name;
  var num = 0;

  var mname = 0, synthName = this.rename(baseName, num);
  do {
    mname = _m(synthName);
    if (this.findSynth_m(mname) === null)
      break;
    synthName = this.rename(baseName, ++num);
  } while (true);

  liq.synthName = synthName;
  this.insertSynth_m(mname, liq);
};

