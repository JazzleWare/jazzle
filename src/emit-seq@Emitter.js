Emitters['SynthSequenceExpression'] =
Emitters['SequenceExpression'] = function(n, prec, flags) {
  var paren = flags & EC_NON_SEQ;
  if (paren) { this.w('('); flags = EC_NONE; }
  var list = n.expressions, i = 0;
  this.eN(list[i], prec, flags);
  i++;
  while (i < list.length) {
    this.wm(',',' ').eN(list[i], false, EC_NONE);
    i++;
  }
  paren && this.w(')');
};
