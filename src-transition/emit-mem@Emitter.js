Emitters['MemberExpression'] = function(n, prec, flags) {
  var objParen = false;
  this.eH(n.object, false, flags);

  if (n.computed)
    this.w('[').eA(n.property, false, EC_NONE).w(']');
  else if (this.isReserved(n.property.name)) {
    this.w('[').w('\'').writeStringWithVal(n.property.name).w('\'');
    this.w(']');
  }
  else {
    this.w('.');
    this.emitIdentifierWithValue(n.property.name);
  }
};
