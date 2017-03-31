Emitters['#ResolvedName'] = function(n, prec, flags) {
  var isV = false;
  if (n.decl.isLexical() &&
    n.decl.ref.scope.insideLoop() && n.decl.ref.indirect)
    isV = true;

  if (n.shouldTest)
    this.emitResolvedName_tz(n, prec, flags, isV);
  else
    this.emitResolvedName_simple(n, prec, flags, isV);
};

this.emitResolvedName_tz = function(n, prec, flags, isV) {
  var paren = flags & (EC_NEW_HEAD|EC_EXPR_HEAD|EC_CALL_HEAD);
  paren && this.w('(');
  this.writeName(n.decl.ref.scope.scs.getLiquid('tz').synthName)
      .w('<').writeNumWithVal(n.decl.i).w('?')
      .jz('tz').wm('(',"'").writeStrWithVal(n.name).wm("'",')').w(':');  
  if (isV)
    this.writeVName(n.decl.synthName, EC_NONE);
  else
    this.writeName(n.decl.synthName);

  paren && this.w(')');
};

this.emitResolvedName_simple = function(n, prec, flags, isV) {
  if (isV) this.writeVName(n.decl.synthName, flags);
  else this.writeName(n.decl.synthName);
};

this.writeVName = function(name, flags) {
  var zero = flags & EC_CALL_HEAD;
  if (zero) this.wm('(','0',',');
  this.writeName(name).wm('.','v');
  zero && this.w(')');
  return this;
};

this.writeName = function(name) {
  this.w(name);
  return this;
};