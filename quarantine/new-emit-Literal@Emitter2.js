Emitters['Literal'] =
function(n, flags, isStmt) {
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.t(ETK_STR).writeString(n.value,"'");
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
  this.rtt();
  isStmt && this.w(';');
  return true;
};
