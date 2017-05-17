Emitters['#Sequence'] = function(n, isStmt, flags) {
  this.emitSynthSequence(n, isStmt, flags);
};

this.emitSynthSequence = function(n, isStmt, flags) {
  var list = n.elements, i = 0;
  if (isStmt)
    while (i < list.length) {
      i && this.l();
      this.emitAny(list[i++], true, EC_START_STMT);
    }
  else {
    var paren = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
    paren && this.w('(');
    while (i < list.length) {
      i && this.wm(',',' ');
      this.eN(list[i++], false, EC_NONE);
    }
    paren && this.w(')');
  }
};
