  import {UntransformedEmitters} from '../other/globals.js';
  import {CB} from '../other/util.js';
  import {EC_NONE} from '../other/constants.js';

UntransformedEmitters['arr-iter-get'] =
function(n, flags, isStmt) {
  var cb = CB(n); this.emc(cb, 'bef' );
  this.eA(n.iter, EC_NONE, false).wm('.','get');
  this.wm('(',')');
  this.emc(cb, 'aft'); // TODO: unnecessary
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter-end'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.eA(n.iter, EC_NONE, false).wm('.','end');
  this.wm('(',')');
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

UntransformedEmitters['arr-iter'] =
function(n, flags, isStmt) {
  this.jz('arrIter', EC_NONE, false).w('(').eN(n.iter, EC_NONE, false).w(')');
  return true;
};

UntransformedEmitters['arr-iter-get-rest'] =
function(n, flags, isStmt) {
  var cb = CB(n);
  this.emc(cb, 'bef' );
  this.eA(n.iter, EC_NONE, false).wm('.','rest').wm('(',')').emc(cb, 'aft');

  return true;
};

