this.synth_ref_may_escape_m = function(mname) {
  return true; 
};


this.synth_name_is_valid_binding_m = function(mname) { 
  return true; 
};


this.synth_ref_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};


this.synth_decl_find_homonym_m =
function(mname, r) {
  this.isBooted || this.synth_boot(r);
  return this.findSynth_m(mname);
};


this.insertSynth_m = this.insertSynth_m =
function(mname, synth) {
  var sn = this.synthNamesUntilNow;
  ASSERT.call(this, !sn.has(mname), '"'+mname+'" exists');
  return sn.set(mname, synth);
};


this.synth_boot =
function(r) {
  if (this.renamer === null)
    this.renamer = r;
  this.synth_boot_init();
  ASSERT.call(this, !this.inBody, 'inside catch' );
