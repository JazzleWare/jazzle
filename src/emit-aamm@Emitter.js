Emitters['UpdateExpression'] = function(n, prec, flags) {
  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o).eH(n.argument);
  } else
    this.eH(n.argument, PREC_NONE, flags).w(o);
};
