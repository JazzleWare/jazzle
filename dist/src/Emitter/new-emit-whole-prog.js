  import {Emitters} from '../other/globals.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {CB} from '../other/util.js';

Emitters['Program'] =
function(n, flags, isStmt) {
  var main = n['#scope'],
      w = this.allow.jzWrapper /* && this.jzHelpers.active.length() > 0 */;
  
  if (this.jzLiquid === null) {
    var lg = main.getLG('jz');
    if (lg)
      this.jzLiquid = lg.getL(0);
    if (w)
      w = !!this.jzLiquid;
  }

  if (w && this.jzLiquid) {
    this.wm('(','function','(',this.jzLiquid.synthName,')','{').l();
    this.allow.jzWrapper = false;
  }

  var lsn = null, own = {used: false};
  lsn = this.listenForEmits(own);
  this.emitSourceHead(n);
  if (lsn.used) { own.used = false; this.trygu(wcb_afterStmt, own); }

  this.emitStmtList(n.body);
  this.emc(CB(n), 'inner');

  own.used || this.grmif(own);

  if (w) {
    this.l().wm('}','(').writeJZHelpers();
    this.wm(')',')',';');
  }
};
