Transformers['CallExpression'] =
function(n, isVal) {
  var ti = false, l = n.callee;
  if (l.type === 'Super') {
    l['#liq'] = this.cur.findRefU_m(RS_SCALL).getDecl();
    var th = this.cur.findRefU_m(RS_THIS).getDecl();
    l['#this'] = this.synth_BareThis(th);
    if (this.thisState & THS_NEEDS_CHK) {
      ti = true;
      var lg = th.ref.scope.gocLG('ti'), li = lg.getL(0);
      if (li === null) { li = lg.newL(); lg.seal(); li.name = 'ti'; }
      l['#ti'] = li;
      li.track(this.cur); li.ref.d--;
    }
  }

  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    if (l.type !== 'Super')
      n.callee = this.tr(n.callee, true );
    this.trList(n.arguments, true );
    if (ti) this.thisState &= ~THS_NEEDS_CHK;
    return n;
  }

  var head = n.callee, mem = null;
  if ( head.type === 'MemberExpression') {
    head.object = this.tr(head.object, true);
    var t = this.allocTemp();
    var h0 = head;
    head = this.synth_TempSave(t, head.object);
    h0.object = t;
    this.releaseTemp(t);
    h0.property = this.tr(h0.property, true );
    mem = h0;
  }
  else if (l.type === 'Super') {
    mem = l;
    head = this.synth_BareThis(this.cur.findRefU_m(RS_THIS).getDecl());
  }
  else
    head = this.tr(head, true );

  this.trList(n.arguments, true );

  if (ti) this.thisState &= ~THS_NEEDS_CHK;
  return this.synth_Call(head, mem, n.arguments);
};
