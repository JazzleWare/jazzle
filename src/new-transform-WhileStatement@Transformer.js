Transformers['WhileStatement'] =
function(n, isVal) {
  var ais = this.setAS(true); 
  ASSERT.call(this, !ais, 'activeIfScope');
  n.test = this.tr(n.test, true);
  this.setAS(ais);
  var w = n['#scope'];
  var l = this.setScope(w), at = this.setAT(this.cur);
  var ns = this.setNS(0);
  n.body = this.tr(n.body, false);

  this.setScope(l).ns = this.curNS;
  this.setAT(at);
  this.setNS(this.curNS + ns);
  this.active1if2(l, w);

  return n;
};
