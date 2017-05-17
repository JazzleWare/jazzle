Emitters['UpdateExpression'] = function(n, isStmt, flags) {
  var paren = flags & EC_EXPR_HEAD;
  var cc = needsConstCheck(n.argument);
  if (!paren) { paren = cc; }
  if (paren) { this.w('('); flags = EC_NONE; }

  cc && this.jz('cc').wm('(','\'')
    .writeStrWithVal(n.argument.name).wm('\'',')',',').s();

  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o).eH(n.argument, false, EC_NONE);
  } else
    this.eH(n.argument, false, flags).w(o);

  paren && this.w(')');
};
