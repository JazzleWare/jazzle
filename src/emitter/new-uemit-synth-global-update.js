UntransformedEmitters['global-update'] =
function(n, flags, isStmt) {
  ;
  var hasParen = flags & EC_NEW_HEAD;
  var td = tg(n.isU ? n.assig.argument : n.assig.left);
  hasParen && this.w('(');
  this.wt(td.synthName+'u', ETK_ID).w('(').eN(n.assig, EC_NONE, false).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};
