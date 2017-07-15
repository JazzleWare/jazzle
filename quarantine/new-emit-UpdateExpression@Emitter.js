// somevery[:wraplimit:]longid--
// (someverylongid
// )--
//
Emitters['UpdateExpression'] =
function(n, flags, isStmt) {
  ;
  var hasParen = flags & EC_EXPR_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }
  var o = n.operator;
  if (n.prefix) {
    this.wt(o, o !== '--' ? ETK_ADD : ETK_MIN);
    flags = EC_NONE;
    this.emitSAT(n.argument, flags, 0);
  }
  else {
    this.emitSAT(n.argument, flags, o.length);
    this.rwr(o); // hard-write because the wrapping affairs have been take care of when calling emitSAT
  }
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
