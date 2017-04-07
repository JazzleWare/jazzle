Emitters['#ResolvedFn'] = function(n, isStmt, flags) {
  var decl = n.decl,
      isV = false;

  if (decl.isLexical() && decl.ref.scope.insideLoop() && decl.ref.indirect)
    isV = true;

  this.w(decl.synthName);
  isV && this.wm('.','v');
  this.wm(' ','=',' ');

  this.emitFn(n.fn, decl.name, EC_NONE);

  isV && this.w('}').w(';');
};
