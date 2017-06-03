Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var e = this.setScope(n['#scope']);
  this.cur.synth_defs_to(this.cur.scs);
  this.trList(n.body, isVal);
  this.setScope(e);
  return n;
};
