Emitters['#DeclAssig'] = function(n, prec, flags) {
  var decl = n.left.decl;
  this.w(decl.synthName).s().w('=').s();
  var isV =
    decl.isLexical() &&
    decl.ref.scope.insideLoop() && decl.ref.indirect;
  isV && this.wm('{','v',':').s();
  n.right ? this.eN(n.right) : this.wm('void',' ','0');
  isV && this.w('}');
  this.w(';');
  if (decl.hasTZ) {
    this.l();
    var liquidSource = decl.ref.scope.scs;
    if (liquidSource.isAnyFnHead())
      liquidSource = liquidSource.funcBody;

    var tz = liquidSource.getLiquid('tz');
    this.wm(tz.synthName,' ','=',' ').writeNumWithVal(decl.i).w(';');
  }
};
