Emitters['UnaryExpression'] = function(n, prec, flags) {
  var lastChar = this.code.charAt(this.code.length-1);
  var o = n.operator;
  if (o === '-' || o === '+')
    lastChar === o && this.s();

  this.w(o);

  this.emitUnaryArgument(n.argument);
};

this.emitUnaryArgument = function(n) {
  if (n.type === 'UnaryExpression' || n.type === 'UpdateExpression')
    this.emitAny(n, false, EC_NONE);
  else
    this.eH(n, false, EC_NONE);
};
