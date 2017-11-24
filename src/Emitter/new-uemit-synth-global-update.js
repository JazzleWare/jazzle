  import {UntransformedEmitters} from '../other/globals.js';
  import {EC_NEW_HEAD, ETK_ID, EC_NONE} from '../other/constants.js';
  import {tg} from '../other/util.js';
  import {cls} from './cls.js';

UntransformedEmitters['global-update'] =
function(n, flags, isStmt) {
  ;
  var hasParen = flags & EC_NEW_HEAD;
  var td = tg(n.isU ? n.assig.argument : n.assig.left);
  hasParen && this.w('(');
  this.wt(td.synthName+'u', ETK_ID).w('(').eN(n.assig, EC_NONE, false).w(')');
  hasParen && this.w(')');
  isStmt && this.w(';');
  return true;
};

