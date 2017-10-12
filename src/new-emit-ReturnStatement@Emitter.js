Emitters['ReturnStatement'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);

  var cb = CB(n);
  this.emc(cb, 'bef');

  this.sl(n.loc.start); // TODO: only ctors without supers

  this.w('return');
  if (n.argument) {
    var param = {hasParen: false};
    this.onw(wcb_afterRet, param);
    this.emitAny(n.argument, EC_NONE, false);
    if (param.hasParen) this.w(')');
  } else
    this.emc(cb, 'ret.aft');
  this.w(';');
  this.emc(cb, 'aft');
};
