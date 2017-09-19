Transformers['WhileStatement'] =
function(n, isVal) {
  var ais = this.setAS(true); 
  ASSERT.call(this, !ais, 'activeIfScope');
  n.test = this.tr(n.test, true);
  this.setAS(ais);
  var l = this.setScope(n['#scope']);
  var ns = this.setNS(0);
  n.body = this.tr(n.body, false);

  this.setScope(l).ns = this.curNS;
  this.setNS(this.curNS + ns);

  return n;
};
