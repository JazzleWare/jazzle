Emitters['ExpressionStatement'] = function(n, prec, flags) {
  this.eA(n.expression, PREC_NONE, EC_START_STMT);
  if (n.expression.type !== 'SequenceStatement')
    this.w(';');
};
