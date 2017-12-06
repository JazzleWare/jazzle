  import {EC_EXPR_HEAD, EC_NON_SEQ, EC_NEW_HEAD, EC_CALL_HEAD} from '../other/constants.js';
  import {_u} from '../other/scope-util.js';
  import {cls} from './cls.js';

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

cls.start =
function() {
  this.writeToSMout('{"version":3,"mappings":"');
  this.inMapping = true;
  this.startFreshLine();
};

cls.flushAll =
function() {
  this.flushCurrentLine();
  this.inMapping = false;

  this.writeToSMout('","names":[');
  var list = this.smNameList, l = 0, len = list.length();
  while (l < len) {
    if (l) this.writeToSMout(',');
    var str = _u(list.keys[l++]);
    this.writeToSMout('"'+str+'"');
  }

  this.writeToSMout('],"sources":[');
  list = this.smSrcList, l = 0, len = list.length();
  while (l < len) {
    if (l) this.writeToSMout(',');
    var str = _u(list.keys[l++]);
    this.writeToSMout('"'+str+'"');
  }

  this.writeToSMout(']}');
};
