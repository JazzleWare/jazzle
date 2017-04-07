Emitters['#DeclAssig'] = function(n, prec, flags) {
  var decl = n.left.decl;
  if (n.right) {
    this.w(decl.synthName);
    var isV =
      decl.isLexical() &&
      decl.ref.scope.insideLoop() && decl.ref.indirect;
    isV && this.wm('.','v');
    this.s().w('=').s();
    this.eN(n.right);
    this.w(';');
  }
  if (decl.hasTZ) {
    this.l();
    var liquidSource = decl.ref.scope.scs;
    if (liquidSource.isAnyFnHead())
      liquidSource = liquidSource.funcBody;

    var tz = liquidSource.findLiquid('<tz>');
    this.wm(tz.synthName,' ','=',' ').writeNumWithVal(decl.i).w(';');
  }
};
