// somevery[:wraplimit:]longid--
// (someverylongid
// )--
//
Emitters['UpdateExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var hasParen = false;
  var l = n.argument;
  var t = false, v = false;
  if (isResolvedName(l)) { t = l.tz; v = l.cv; hasParen = t || v; }
  else hasParen = flags & EC_EXPR_HEAD;

  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (t) { this.emitAccessChk_tz(l.target); this.w(',').os(); }
  if (v) { this.emitAccessChk_invalidSAT(l.target); this.w(',').os(); }

  var o = n.operator;
  if (n.prefix) {
    this.wt(o, o !== '--' ? ETK_ADD : ETK_MIN);
    flags = EC_NONE;
    this.emitSAT(n.argument, flags, 0);
  }
  else {
    this.emitSAT(n.argument, flags, o.length);
    this.rwr(o); // hard-write because the wrapping affairs have been take care of when calling emitSAT
  }
  hasParen && this.w(')');
  this.emc(cb, 'aft');

  isStmt && this.w(';');
  return true;
};
