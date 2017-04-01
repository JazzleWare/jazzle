Emitters['UpdateExpression'] = function(n, prec, flags) {
  var cc = needsConstCheck(n.argument);
  cc && this.w('(').jz('cc').wm('(','\'')
    .writeStrWithVal(n.argument.name).wm('\'',')',',').s();

  var o = n.operator;
  if (n.prefix) {
    if (this.code.charCodeAt(this.code.length-1) === o.charCodeAt(0))
      this.s();
    this.w(o).eH(n.argument);
  } else
    this.eH(n.argument, PREC_NONE, flags).w(o);

  cc && this.w(')');
};
