Transformers['Program'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.script = n['#scope'];

  var g = this.global = this.script.parent;

  if (g.isGlobal())
    g.synth_globals(this.renamer);
  else
    ASSERT.call(this, g.isBundle(), 'script can not have a non-global parent');


  var ps = this.setScope(this.script);
  var ts = this.setTS([]);

  this.cur.synth_start(this.renamer);
  this.trList(n.body, isVal);
  this.cur.synth_finish();

  this.setScope(ps);
  this.setTS(ts);

  return n;
};
