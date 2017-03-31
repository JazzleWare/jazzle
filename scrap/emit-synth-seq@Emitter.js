Emitters['SequenceStatement'] = function(n, prec, flags) {
  var list = n.expressions, i = 0;
  while (i < list.length) {
    if (i > 0) this.l();
    this.emitAsStmt(list[i++]);
  }
};

this.emitAsStmt = function(seqElem) {
  switch (seqElem.type) {
  case 'AssignmentExpression':
  case 'SyntheticAssignment':
  seqElem = synth_exprstmt(seqElem);
  }

  this.emitAny(seqElem, PREC_NONE, EC_NONE);
};
