Emitters['#ResolvedFn'] = function(n, isStmt, flags) {
  var decl = n.decl,
      isV = false,
      withVar = false;

  if (decl.isLexical() && decl.ref.scope.insideLoop() && decl.ref.indirect)
    isV = true;

  if (isV || decl.synthName !== decl.name)
    withVar = !decl.isFuncArg();

  if (withVar) {
    this.w('var').s();
    this.wm(decl.synthName,' ','=').s();
    isV && this.wm('{','v',':').s();
  }

  this.emitFn(n.fn, decl.name, EC_NONE);

  isV && this.w('}');
  withVar && this.w(';');
};
