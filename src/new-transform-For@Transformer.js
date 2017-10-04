Transformers['ForOfStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#scope']);
  var t = null;
  n.right = this.tr(n.right, true);
  t = this.allocTemp();
  var l = n.left; 
  n.left = t;

  var releaseAfter = n.type === 'MemberExpression'; // because mem might need temps when getting transformed

  releaseAfter || this.releaseTemp(t);

  var lead = null;
  var tval = this.synth_TVal(t);
  if (l.type === 'VariableDeclaration') {
    l.declarations[0].init = tval;
    lead = this.tr(l, false);
  }
  else
    lead = this.tr(this.synth_SynthAssig(l, tval, false), false);

  releaseAfter && this.releaseTemp(t);

  n.body = this.tr(n.body, false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else
    n.body = this.synth_AssigList([lead, n.body]);

  n.type = '#ForOfStatement';

  this.setScope(s);

  return n;
};
