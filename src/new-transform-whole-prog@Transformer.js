Transformers['Program'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  this.script = n['#scope'];
  if (this.bundler)
    n['#imports'] = n['#scope'].satisfyWith(this.bundler);

  this.global = this.script.parent;
  ASSERT.call(this, this.global.isBundle(), 'script can not have a non-global parent');
  var ps = this.setScope(this.script);
  var ts = this.setTS([]);

  this.cur.synth_start();
  this.trList(n.body, isVal);
  this.cur.synth_finish();

  return n;
};
