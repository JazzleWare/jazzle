UntransformedEmitters['arg-at'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  if (paren) this.w('(');
  this.wm('arguments','.','length','>').writeNumWithVal(n.idx)
      .wm(' ','?',' ','arguments','[').writeNumWithVal(n.idx)
      .wm(']',' ',':',' ','void',' ','0');
  if (paren) this.w(')');
};
