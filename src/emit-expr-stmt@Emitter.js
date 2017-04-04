Emitters['ExpressionStatement'] = function(n, isStmt, flags) {
  if (n.expression.type === '#Sequence')
    this.emitSynthSequence(n.expression, true, EC_NONE);
  else { 
    this.eA(n.expression, false, EC_START_STMT);
    this.w(';');
  }
};
