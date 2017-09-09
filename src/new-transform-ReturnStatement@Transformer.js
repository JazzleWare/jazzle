Transformers['ReturnStatement'] =
function(n, isVal) {
  // TODO: try { return 'a' /* <-- this */ } finally { yield 'b' }
  if (n.argument)
    n.argument = this.tr(n.argument, true);
  var retRoot = this.cur.scs;
  RET:
  if (retRoot.isCtor() && retRoot.parent.hasHeritage()) {
    var lg = retRoot.gocLG('ti'), l = lg.getL(0);
    if (l===null) { l = lg.newL(); lg.seal(); l.name = 'ti'; }
    if ((this.thisState & THS_IS_REACHED) || !(this.thisState & THS_NEEDS_CHK)) break RET;
    l.track(this.cur);
    n.argument = this.synth_RCheck(n.argument, l);
  }
  return n;
};
