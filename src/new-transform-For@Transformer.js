Transformers['ForOfStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#scope']);
  this.cur.synth_defs_to(this.cur.scs);

  var t = null;
  n.right = this.tr(n.right, true);
  t = this.allocTemp();
  var l = n.left; 
  n.left = t;

  var lead = null;
  var tval = this.synth_TVal(t);
  if (l.type === 'VariableDeclaration') {
    l.declarations[0].init = tval;
    lead = this.tr(l, false);
  }
  else
    lead = this.tr(this.synth_SynthAssig(l, tval, false), false);

  n.body = this.tr(n.body, false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else
    n.body = this.synth_AssigList([lead, n.body]);

  this.releaseTemp(t);

  n.type = '#ForOfStatement';

  this.setScope(s);

  return n;
};

Transformers['ForInStatement'] =
function(n, isVal) {
  var left = n.left;
  var b = false;

  var s = this.setScope(n['#scope']);

  this.cur.synth_defs_to(this.cur.scs );

  if (left.type === 'VariableDeclaration') {
    b = true;
    var elem = left.declarations[0];
    left = elem.init === null ? elem.id : { // TODO: ugh
      type: 'AssignmentPattern',
      right: elem.init,
      left: elem.id,
      end: elem.init.end,
      loc: { start: elem.id.loc.start, end: elem.init.loc.end },
      start: elem.id.start,
      '#c': {}
    };
    n.left = left;
  }

  var lead = null, t = left.type ;

  if (t === 'Identifier') // TODO: must also handle renamedGlobals
    TransformByLeft['Identifier'].call(this, n, false, b);
  else if (t === 'MemberExpression') {
    n.right = this.tr(n.right, true);
    n.left = this.trSAT(n.left);
  }
  else {
    n.right = this.tr(n.right, true);
    var t = this.allocTemp(); this.releaseTemp(t);
    var assig = this.synth_SynthAssig(n.left, t, b);
    lead = this.tr(assig, false );
    b = false; // because binding becomes t below
    n.left = t;
  }

  n.body = this.tr(n.body,false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else if (lead)
    n.body = this.synth_AssigList([lead, n.body]);

  n.type = b ? '#ForInStatementWithDeclarationHead' : 
    '#ForInStatementWithExHead';

  this.setScope(s);
  return n;
};
