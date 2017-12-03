  import {UntransformedEmitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {EC_ATTACHED, EC_EXPR_HEAD, EC_NON_SEQ, EC_IN} from '../other/constants.js';
  import {wcb_afterStmt} from '../other/wcb.js';

UntransformedEmitters['assig-list'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  var attached = flags & EC_ATTACHED;
  attached && this.w('{').i().gu(wcb_afterStmt);

  if (isStmt) {
    this.emc(cb, 'bef');
    this.emitStmtList(n.list);
    this.emc(cb, 'inner');
    this.emc(cb, 'left.aft');
    this.emc(cb, 'aft');
  }
  else {
    var hasParen = flags & (EC_EXPR_HEAD|EC_NON_SEQ);
    if (hasParen) { this.w('('); flags &= EC_IN; }
    this.emc(cb, 'bef');
    this.emitCommaList(n.list, flags);
    this.emc(cb, 'inner');
    this.emc(cb, 'left.aft');
    this.emc(cb, 'aft');
    hasParen && this.w(')');
  }

  attached && this.u().l().w('}');
};

