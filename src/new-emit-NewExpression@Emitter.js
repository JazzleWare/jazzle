Emitters['NewExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    this.wt('new', ETK_ID).onw(wcb_afterNew).os().emitNewHead(n.callee);
    this.w('(').emitCommaList(n.arguments).w(')');
  } else {
    var hasParen = flags & EC_NEW_HEAD;
    if (hasParen) { this.w('('); flags = EC_NONE; }
    this.jz('n').w('(').eN(n.callee, EC_NONE, false).wm(',','')
      .jz('arr').w('(').emitElems(n.arguments, si >= 0);

    this.w(')').w(')');
    hasParen && this.w(')');
  }

  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};
