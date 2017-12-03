  import {UntransformedEmitters} from '../other/globals.js';
  import {EC_NONE} from '../other/constants.js';

UntransformedEmitters['memlist'] =
function(n, flags, isStmt) {
  var list = n.m, tproto = n.p, e = 0;
  var m = 0;
  while (e < list.length) {
    var mem = list[e++];
    if (mem === null) continue;
    if (m) isStmt ? this.w(';').l() : this.w(',').os();
    this.eH(tproto);
    if (mem.computed || mem.key.type === 'Literal')
      this.w('[').eA(mem.key, EC_NONE, false).w(']');
    else
      this.w('.').writeMemName(mem.key, false);
    this.wm('','=','').eA(mem.value, EC_NONE, false );
    m++;
  }
  isStmt && m && this.w(';');
};

