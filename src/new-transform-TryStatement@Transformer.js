Transformers['TryStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#tryScope']);
  this.cur.synth_defs_to(this.cur.scs);
  n.block = this.tr(n.block, false);
  this.setScope(s);

  if (n.handler)
    n.handler = this.transformCatch(n.handler);

  if (n.finalizer) {
    s = this.setScope(n['#finScope']);
    n.finalizer = this.tr(n.finalizer, false);
    this.setScope(s);
  }
 
  return n;
};

this.transformCatch =
function(n) {
  var a = null, s = this.setScope(n['#scope']);
  ASSERT.call(this, !this.inBody, 'inside catch' );

  if (this.cur.argIsSimple) {
    this.cur.argIsSignificant = true;
    this.cur.synth_start(this.renamer);
  }
  else {
    this.cur.synth_start(this.renamer);
    a = this.transformCatchArgs(n);
  }
  this.cur.activateBody();
  n.body = this.tr(n.body, false);
  this.cur.deactivateBody();
  this.cur.argIsSignificant || this.cur.synth_lcv();
  n['#argPrologue'] = a;
  this.setScope(s);
  return n;
};

this.transformCatchArgs =
function(n) {
  ASSERT.call(this, !this.cur.argIsSimple, 'catch' );
  var l = this.synth_SynthAssig(n.param, this.synth_SynthName(this.cur.catchVar), true);

  return this.tr(l, false);
};
