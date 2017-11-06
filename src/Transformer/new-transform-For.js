Transformers['ForOfStatement'] =
function(n, isVal) {
  var s = this.setScope(n['#scope']);
  this.cur.synth_defs_to(this.cur.synthBase);

  var t = null;
  n.right = this.tr(n.right, true);
  t = this.allocTemp();
  var l = n.left; 
  n.left = t;

  var lead = null;
  var tval = this.synth_TVal(t), isVar = false, simp = true;
  if (l.type === 'VariableDeclaration' && l.kind !== 'var') {
    isVar = true;
    simp = l.declarations[0].id.type === 'Identifier'; 
    l.declarations[0].init = tval;
    lead = this.tr(l, false);
  }
  else
    lead = this.tr(this.synth_SynthAssig(l, tval, false), false);

  if (isVar)
    lead = this.synth_AssigList([this.synth_NameList(this.cur, true), lead]);

  n.body = this.tr(n.body, false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else
    n.body = this.synth_AssigList([lead, n.body]);

  this.releaseTemp(t);

  n.type = '#ForOfStatement';
//if (isVar && simp)
//  n = this.synth_AssigList([this.synth_NameList(this.cur, false), n]);

  this.setScope(s);

  return n;
};

Transformers['ForInStatement'] =
function(n, isVal) {
  var left = n.left;
  var simp = true;
  var s = this.setScope(n['#scope']);

  this.cur.synth_defs_to(this.cur.synthBase );
  var isVar = false;
  if (left.type === 'VariableDeclaration') {
    isVar = true;
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
    simp = left.type === 'Identifier';
  }

  var lead = null, t = left.type ;

  if (t === 'Identifier') // TODO: must also handle renamedGlobals
    TransformByLeft['Identifier'].call(this, n, false, isVar);
  else if (t === 'MemberExpression') {
    n.right = this.tr(n.right, true);
    n.left = this.trSAT(n.left);
  }
  else {
    n.right = this.tr(n.right, true);
    var t = this.allocTemp(); this.releaseTemp(t);
    var assig = this.synth_SynthAssig(n.left, t, isVar);
    lead = this.tr(assig, false );
    n.left = t;
  }

  if (isVar && !simp) {
    var a = [this.synth_NameList(this.cur, true)];
    if (lead) a. push(lead );
    lead = this.synth_AssigList(a);
  }

  n.body = this.tr(n.body,false);
  if (n.body.type === 'BlockStatement')
    n.body['#lead'] = lead;
  else if (lead)
    n.body = this.synth_AssigList([lead, n.body]);

  n.type = (isVar && simp) ? '#ForInStatementWithDeclarationHead' : 
    '#ForInStatementWithExHead';

  if (isVar && simp)
    n = this.synth_AssigList([this.synth_NameList(this.cur, false), n]);

  this.setScope(s);
  return n;
};
