Transformers['CallExpression'] =
function(n, isVal) {
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    n.callee = this.tr(n.callee, true );
    this.trList(n.arguments, true );
    return n;
  }

  var head = n.callee, mem = null;
  if ( head.type === 'MemberExpression') {
    var t = this.allocTemp();
    var h0 = head;
    head = this.synth_TempSave(t, head.object);
    h0.object = t;
    this.releaseTemp(t);
    h0.property = this.tr(h0.property, true );
    mem = h0;
  }
  else
    head = this.tr(head, true );

  this.trList(n.arguments, true );

  return this.synth_Call(head, mem, n.arguments);
};
