  import {Emitters} from '../other/globals.js';
  import {CB, findElem} from '../other/util.js';
  import {ETK_ID, EC_NEW_HEAD, EC_NONE} from '../other/constants.js';
  import {wcb_afterNew} from '../other/wcb.js';

Emitters['NewExpression'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  var si = findElem(n.arguments, 'SpreadElement');
  if (si === -1) {
    this.wt('new', ETK_ID).gu(wcb_afterNew).os().emitNewHead(n.callee);
    this.w('(').emitCommaList(n.arguments);
    this.emc(cb, 'inner');
    this.w(')');
  } else {
    var hasParen = flags & EC_NEW_HEAD;
    if (hasParen) { this.w('('); flags = EC_NONE; }
    this.jz('n').w('(').eN(n.callee, EC_NONE, false).wm(',','')
      .jz('arr').w('(').emitElems(n.arguments, si >= 0, cb);

    this.emc(cb, 'inner');
    this.w(')').w(')');
    hasParen && this.w(')');
  }

  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

