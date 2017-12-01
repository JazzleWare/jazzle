  import {UntransformedEmitters} from '../other/globals.js';
  import {ASSERT_EQ, ETK_ID, ASSERT, EC_NONE} from '../other/constants.js';
  import {CB, isResolvedName, isTemp} from '../other/util.js';

UntransformedEmitters['arg-at'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, false);
  this.wt('arguments', ETK_ID).w('[');
  this.wm(n.idx+"",']');

  return true;
};

UntransformedEmitters['arg-rest'] =
function(n, flags, isStmt) {
  ASSERT_EQ.call(this, isStmt, true);
  var cb = CB(n); this.emc(cb, 'bef' );
  var l = n.left;
  ASSERT.call(this, isResolvedName(l) || isTemp(l), 'neither id nor temp');
  this.eA(l, EC_NONE, false)
    .wm('','=','','[',']',';').l()
    .wm('while','','(').eA(l, EC_NONE, false)
    .wm('.','length')
    .wm('+',n.idx+"",'','<','','arguments','.','length',')').i().l()
    .eA(l, EC_NONE, false).w('[').eA(l, EC_NONE, false).wm('.','length')
    .w(']')
    .wm('','=',' ','arguments','[').
    eA(l, EC_NONE, false).wm('.','length','+',n.idx+"",']',';').u();
  this.emc(cb, 'aft');
  return true;
};

