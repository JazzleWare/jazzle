Transformers['ThisExpression'] =
function(n, isVal) {
  var ref = this.cur.findRefU_m(RS_THIS);
  ASSERT.call(this, ref, 'could not find [:this:]');
  var th = ref.getDecl();
  var ths = this.thisState;
  if ((ths & THS_NEEDS_CHK) && !(ths & THS_IS_REACHED)) {
    var lg = th.ref.scope.scs.gocLG('ti');
    var ti = lg.getL(0);
    if (ti === null) { ti = lg.newL(); ti.name = 'ti'; lg.seal(); }
    ti.track(this.cur);

    // that is, no longer check; but, TODO: better make this optimization optional to turn off
    // class A extends L { constructor() { this/* <-- need */; this /* <-- needn't since the previous one has done it */ } }
    this.thisState &= ~THS_NEEDS_CHK;

    return this.synth_ResolvedThis(n, th, true);
  }

  return this.synth_ResolvedThis(n, th, false);
};
