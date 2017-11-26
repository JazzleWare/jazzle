  import {EC_EXPR_HEAD, EC_NON_SEQ, EC_NEW_HEAD, EC_CALL_HEAD} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.emitAny =
function(n, flags, isStmt) {
  var emitters = this.emitters, t = n.type;
  if (t in emitters)
    return emitters[t].call(this, n, flags, isStmt );

  this.err('unknown.node');
};

cls.emitHead =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_EXPR_HEAD|EC_NON_SEQ, isStmt); };

cls.emitNonSeq =
function(n, flags, isStmt) { return this.emitAny(n, flags|EC_NON_SEQ, isStmt); };

cls.emitNewHead =
function(n, flags, isStmt) {
  return this.emitHead(n, EC_NEW_HEAD, false);
};

cls.emitCallHead =
function(n, flags, isStmt) {
  return this.emitHead(n, flags|EC_CALL_HEAD, false);
};


