Emitters['CallExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef');
  var hasParen = flags & EC_NEW_HEAD;

  var c = n.callee;
  var e = c.type === 'Super';
  var l = e ? c['#ti'] : null;

  if (hasParen) { this.w('('); flags = EC_NONE; }

  if (l && l.ref.d) this.jz('o').w('(');
  if (e)
    this.wt(c['#liq'].synthName, ETK_ID).wm('.','call');
  else
    this.emitCallHead(c, flags);

  this.lw(c.loc.end);

  this.w('(');
  if (e) {
    this.eN(c['#this'], EC_NONE, false );
    n.arguments.length && this.wm(',','');
  }

  this.emitCommaList(n.arguments);
  this.emc(cb, 'inner');
  this.w(')');

  if (l && l.ref.d)
    this.wm(',','',l.synthName,'','=','','1').w(')');
  hasParen && this.w(')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
};
