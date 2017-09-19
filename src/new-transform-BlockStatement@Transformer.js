Transformers['BlockStatement'] =
function(n, isVal) {
  ASSERT_EQ.call(this, isVal, false);
  var s = this.setScope(n['#scope']);
  var a = this.setAT(this.cur);
  var l = this.setNS(0);
  this.cur.synth_defs_to(this.cur.scs);
  this.trList(n.body, isVal);
  this.active1if2(s, this.cur);
  this.setScope(s);
  this.setAT(a).ns = this.curNS;
  this.setNS(l+this.curNS);
  return n;
};
