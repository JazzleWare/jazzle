Transformers['DoWhileStatement'] =
function(n, isVal) {
  this.incNS();
  var w = n['#scope'];
  var s = this.setScope(w);
  var l = this.setAT(this.cur), e = this.setNS(0);
  n.body = this.tr(n.body, false);
  this.setScope(s).ns = this.curNS;
  this.setNS(this.curNS+e );
  this.setAT(l);

  var ais = this.setAS(true);
  n.test = this.tr(n.test, true);
  this.setAS(ais);

  this.active1if2(l, w);

  return n;
};
