Emitters['ExpressionStatement'] = function(n, prec, flags) {
  if (n.expression.type === '#Sequence')
    this.emitSynthSequence(n.expression, flags, false);
  else { 
    this.eA(n.expression, PREC_NONE, EC_START_STMT);
    this.w(';');
  }
};
