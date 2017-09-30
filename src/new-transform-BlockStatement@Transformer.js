Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var bs = n['#scope'];
  var s = null;
  if (bs !== null) {
    s = this.setScope(bs);
    this.cur.synth_defs_to(this.cur.scs);
  }
  this.trList(n.body, isVal);
  if (bs !== null) this.setScope(s);
  return n;
};
