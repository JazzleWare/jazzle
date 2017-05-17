Emitters['Identifier'] = function(n, prec, flags) {
  return this.emitIdentifierWithValue(n.name);
};

// TODO: write chunks instead of characters
this.writeIdentifierName =
this.emitIdentifierWithValue = function(value) {
  var i = 0;
  while (i < value.length) {
    var ch = value.charCodeAt(i);
    if (ch <= 0xFF) this.w(value.charAt(i));
    else this.writeUnicodeEscapeWithValue(ch);
    i++;
  }
};
