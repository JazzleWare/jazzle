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

if (false) {
Emitters['Identifier'] = function(n, prec, flags) {
  var paren = false, zero = false;
  var needsTest = false, isV = false;

  var name = n.name;
  var decl = this.findRef(name).getDecl();
  if (decl.isLexical() && decl.scope.insideLoop() && decl.ref.indirect)
    isV = true;
  if (flags & EC_CALL_HEAD)
    zero = true;

  needsTest = this.currentScope.shouldTest(decl);

  if (zero)
    paren = true;
  else if (needsTest)
    paren = flags & (EC_EXPR_HEAD|EC_CALL_HEAD|EC_NEW_HEAD);

  paren && this.w('(');
  zero && this.wm('0',',');
  if (needsTest)
    this.writeTDZ(decl.synthName, decl);
  else
    this.writeName(decl.synthName);
};

this.writeTDZ = function(declName, decl) {
  var tdzVar = decl.ref.scope.scs.getLiquid('tz');
  this.writeName(tdzVar.synthName);
  this.wm('<');
  this.writeNumWithVal(decl.i);
  this.wm('?','jz','.','tz','(','\'').writeStringWithVal(decl.name);
  this.w('\'').w(')');
  this.wm(':').writeName(declName);
};

this.writeName = function(name) {
  this.w(name); // TODO: name has to get tested for being an actual identifier
};
}
