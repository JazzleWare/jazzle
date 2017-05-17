Emitters['#DeclAssig'] = function(n, prec, flags) {
  var decl = n.left.decl;
  var isV =
    decl.isLexical() &&
    decl.ref.scope.insideLoop() && decl.ref.indirect;
  if (!isV) {
    if (decl.isFuncArg() || decl.isLexical())
      this.wm('var',' ');
  }
  this.w(decl.synthName);
  if (isV)
    this.wm('.','v');
  if (n.right) {
    this.s().w('=').s();
    this.eN(n.right);
  }
  else if (decl.ref.scope.insideLoop())
    this.wm(' ','=',' ','void',' ','0');

  this.w(';');
  if (decl.hasTZ) {
    this.l();
    var liquidSource = decl.ref.scope.scs;
    if (liquidSource.isAnyFnHead())
      liquidSource = liquidSource.funcBody;

    var tz = liquidSource.findLiquid('<tz>');
    this.wm(tz.synthName,' ','=',' ').writeNumWithVal(decl.i).w(';');
  }
};
