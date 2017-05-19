Emitters['Literal'] =
function(n, flags, isStmt) {
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.w("'").writeStringValue(n.value).w("'");
    break;
  case BOOL_TYPE: 
    this.w(n.value ? 'true' : 'false');
    break;
  case NUMBER_TYPE:
    this.w(n.value+"");
    break;
  default:
    ASSERT.call(this, false, 'unknown value');
    break;
  }
};
