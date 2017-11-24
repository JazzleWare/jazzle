  import {CB} from '../other/util.js';
  import {EC_NONE} from '../other/constants.js';
  import {Emitters} from '../other/globals.js';
  import {cls} from './cls.js';

this.emitMemex =
function(n, flags, isStmt, len) {
  var cb = CB(n); this.emc(cb, 'bef' );
//this.sl(n.loc.start);
  this.eH(n.object, flags, false);
  this.sl(n['#acloc']);
  if (n.computed) {
    this.w('[').eA(n.property, EC_NONE, false);
    if (len > 0 && this.ol(1+len) > 0) this.wrapCurrentLine();
    this.w(']');
  }
  else {
    this.w('.').emc(CB(n.property), 'bef');
    this.writeIDName(n.property.name); // TODO: node itself rather than its name's string value
  }
  this.emc(cb, 'aft');
  isStmt && this.w(';');
  return true;
};

this.emitSAT_mem = 
function(n, flags, len) { return this.emitMemex(n, flags, false, len); };

Emitters['MemberExpression'] =
function(n, flags, isStmt, len) { return this.emitMemex(n, flags, isStmt, 0); };

