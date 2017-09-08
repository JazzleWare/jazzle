Emitters['CallExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef');
  var hasParen = flags & EC_NEW_HEAD;
  if (hasParen) { this.w('('); flags = EC_NONE; }

  var c = n.callee;

  if (c.type === 'Super')
    this.wt(c['#liq'].synthName).wm('.','call');
  else
    this.emitCallHead(n.callee, flags);

  this.w('(');
  if (c.type === 'Super') {
    this.eN(c['#this'], EC_NONE, false );
    n.arguments.length && this.wm(',','');
  }

  this.emitCommaList(n.arguments);
  this.emc(cb, 'inner');
  this.w(')');

  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
};
