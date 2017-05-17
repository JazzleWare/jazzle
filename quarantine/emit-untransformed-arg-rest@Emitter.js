UntransformedEmitters['arg-rest'] = function(n, isStmt, flags) {
  this.eA(n.target, false, EC_NONE).s().w('=').s().wm('[',']',';').l()
      .wm('while',' ','(').eA(n.target)
      .wm('.','length',' ','<',' ','arguments','.','length');
  if (n.idx !== 0) this.w('-').writeNumWithVal(n.idx);
  this.w(')').i().l()
      .eA(n.target, false, EC_NONE).w('[').eA(n.target, false, EC_NONE)
      .wm('.','length',']',' ','=',' ','arguments','[').eA(n.target, false, EC_NONE).w('.')
      .wm('length');
  if (n.idx !== 0) this.w('+').writeNumWithVal(n.idx);
  this.wm(']',';').u();
};
