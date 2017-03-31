Emitters['#Sequence'] = function(n, prec, flags) {
  this.emitSynthSequence(n, flags, true);
};

this.emitSynthSequence = function(n, flags, isExpr) {
  var list = n.elements, i = 0;
  if (isExpr)
    while (i < list.length) {
      i && this.wm(',',' ');
      this.eN(list[i++]);
    }
  else
    while (i < list.length) {
      i && this.l();
      this.emitAsStatement(list[i++]);
    }
};
