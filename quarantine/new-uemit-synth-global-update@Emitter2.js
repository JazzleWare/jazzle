UntransformedEmitters['global-update'] =
function(n, flags, isStmt) {
  var hasParen = flags & EC_NEW_HEAD;
  var td = (n.isU ? n.assig.argument : n.assig.left).target;
  hasParen && this.w('(');
  this.wm(td.synthName+'u','(').eN(n.assig, EC_NONE, false).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
