Emitters['#ForOfStatement'] =
function(n, flags, isStmt) {
  this.w('for').os().w('(');
  this.eH(n.left, EC_NONE, false).os().w('=').os().jz('of').w('(');
  this.eN(n.right, EC_NONE, false).w(')');

  this.w(';').os().eH(n.left, EC_NONE, false).w('.').wm('next','(',')',';',')');
  this.emitBody(n.body);
};
