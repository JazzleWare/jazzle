Emitters['Literal'] =
this.emitLiteral = function(n, prec, flags) {
  switch (n.value) {
  case true: return this.write('true');
  case false: return this.write('false');
  case null: return this.write('null');
  default:
    switch (typeof n.value) {
    case NUMBER_TYPE:
      return this.emitNumberLiteralWithValue(n.value);
    case STRING_TYPE:
      return this.emitStringLiteralWithRawValue(n.raw);
    }
    ASSERT.call(this, false,
      'Unknown value for literal: ' + (typeof n.value));
  }
};

this.emitNumberLiteralWithValue =
function(nv) {
  this.write(""+nv);
};

this.emitStringLiteralWithRawValue =
function(svRaw) {
  this.write(svRaw);
};
