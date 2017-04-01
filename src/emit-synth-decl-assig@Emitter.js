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
    var tz = decl.ref.scope.scs.getLiquid('tz');
    this.wm(tz.synthName,' ','=',' ').writeNumWithVal(decl.i).w(';');
  }
};
