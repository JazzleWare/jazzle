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
  var s = this.setScope(n['#scope']);
  this.cur.synth_start(this.renamer);
  ASSERT.call(this, !this.inBody, 'inside catch' );
  var ap = this.transformCatchArgs(n);
  this.activateBody();
  n.body = this.tr(n.body, false);
  this.deactivateBody();
  this.cur.synth_finish();
  n['#argPrologue'] = ap;
  return n;
//ASSERT.call(this, !this.cur.inBody, 'inside catch');
//if (this.cur.argIsSimple)
//  this.cur.argIsSignificant = true; // if it hasn't got yields in it
};
