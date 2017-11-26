  import {Emitters} from '../other/globals.js';
  import {CB, isInteger} from '../other/util.js';
  import {ETK_ID, STRING_TYPE, ETK_NONE, BOOL_TYPE, NUMBER_TYPE, ETK_NUM, ASSERT, HAS} from '../other/constants.js';
  import {wcb_intDotGuard} from '../other/wcb.js';

Emitters['Literal'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var isRegex = HAS.call(n, 'regex');
  if (n.value === null && !isRegex)
    this.wt('null',ETK_ID);
  else
  switch (typeof n.value) {
  case STRING_TYPE: 
    this.writeString(n.value,"'");
    this.ttype = ETK_NONE;
    break;
  case BOOL_TYPE: 
    this.wt(n.value ? 'true' : 'false', ETK_ID);
    break;
  case NUMBER_TYPE:
    this.wt(n.value+"", ETK_NUM);
    if (isInteger(n.value))
      this.gu(wcb_intDotGuard );
    break;
  default:
    if (isRegex)
      this.wt(n.raw,ETK_DIV);
    else
      ASSERT.call(this, false, 'unknown value');
    break;
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');

  return true;
};
