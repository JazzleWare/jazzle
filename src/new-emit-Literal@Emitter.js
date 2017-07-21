Emitters['Literal'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.t(ETK_STR).writeString(n.value,"'");
    this.curtt = ETK_NONE;
    break;
  case BOOL_TYPE: 
    this.wt(n.value ? 'true' : 'false', ETK_ID);
    break;
  case NUMBER_TYPE:
    this.wt(n.value+"", ETK_NUM);
    if (isInteger(n.value))
      this.onw(wcb_intDotGuard );
    break;
  default:
    ASSERT.call(this, false, 'unknown value');
    break;
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');

  return true;
};
