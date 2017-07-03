this.synth_ref_may_escape_m =
function(mname) { return !ref_arguments_m(mname); };

this.synth_name_is_valid_binding_m =
function(mname) { return true; };

this.synth_ref_find_homonym_m =
function(mname) {
  this.isBooted || this.synth_boot();
  var synth = this.findSynth_m(mname)
  if (synth === null && this.scopeName && this.scopeName.hasName_m(mname))
    synth = this.scopeName;
  return synth;
};

this.synth_decl_find_homonym_m =
function(mname) {
  this.isBooted || this.synth_boot();
  return this.findSynth_m(mname);
};

this.synth_boot =
function() {
  this.synth_boot_init();
  ASSERT.call(this, !this.inBody, 'inBody');
  this.synth_args();
  this.activateBody();
  this.synth_defs_to(this);
  this.deactivateBody();
};

this.synth_start =
function() {
  this.isBooted || this.synth_boot();
  this.synth_externals();
};

this.synth_externals =
function() {
  ASSERT.call(this, !this.inBody, 'inBody');
  var list = this.argRefs, e = 0, len = list.length();
  while (e < len) {
    var item = list.at(e++);
    if (item) {
      var target = item.getDecl(), mname = "";
      ASSERT.call(this, target.synthName !== "" || target.isGlobal(), 'synth');

      mname = _m(target.synthName);
      var synth = this.findSynth_m(mname);
      if (synth !== target) {
        ASSERT.call(this, synth === null, 'override');
        this.insertSynth_m(mname, target);
      }
    }
  }
};

this.synth_args =
function() {
  var list = this.argList, nmap = {}, e = list.length - 1;
  while (e >= 0) {
    var arg = list[e], mname = _m(arg.name);
    if (!HAS.call(nmap, mname)) {
      nmap[mname] = arg;
      this.synthDecl(arg);
    }
    e--;
  }
};
