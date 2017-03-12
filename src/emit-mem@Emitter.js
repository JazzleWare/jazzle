Emitters['MemberExpression'] = function(n, prec, flags) {
  var objParen = false;
  this.eH(n.object, prec, flags);

  if (n.computed)
    this.w('[').eA(n.property, PREC_NONE, EC_NONE).w(']');
  else if (this.isReserved(n.property.name)) {
    this.w('[').emitStringLiteralWithRawValue("'"+n.property.name+"'");
    this.w(']');
  }
  else {
    this.w('.');
    this.emitIdentifierWithValue(n.property.name);
  }
};
