  import {Emitters} from '../other/globals.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {CB} from '../other/util.js';
  import {cls} from './cls.js';

Emitters['Program'] =
function(n, flags, isStmt) {
  var main = n['#scope'];

  var lsn = null, own = {used: false};
  lsn = this.listenForEmits(own);
  this.emitSourceHead(n);
  if (lsn.used) { own.used = false; this.trygu(wcb_afterStmt, own); }

  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');

  own.used || this.grmif(own);
};

