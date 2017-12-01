  import {Emitters} from '../other/globals.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './cls.js';

Emitters['#Bundler'] =
function(n, flags, isStmt) {
  var w = this.allow.jzWrapper /* && this.jzHelpers.active.length() > 0 */;

  if (this.jzLiquid === null) {
    var lg = n.bundleScope.getLG('jz');
    if (lg) this.jzLiquid = lg.getL(0);
  }

  if (w) {
    this.wm('(','function','(',n.bundleScope.getLG('jz').getL(0).synthName,')','{').l();
    this.allow.jzWrapper = false;
  }

  this.emitBundleItem(n.rootNode);

  if (w) {
    this.l().wm('}','(').writeJZHelpers();
    this.wm(')',')',';');
  }

  console.error(
    this.sm,
    this.smSrcList.keys,
    this.smNameList.keys
  );
};

cls.emitBundleItem =
function(n) {
  var list = n['#imports'], len = list === null ? 0 : list.length, l = 0;
  var lsn = null;
  var own = {used: false};

  while (l < len) {
    var im = list[l++];
    lsn = this.listenForEmits(own);
    this.emitBundleItem(im);
    if (lsn.used) {
      own.used = false;
      this.trygu(wcb_afterStmt, own);
    }
  }

  var nc = this.smSetSrc_str(n['#scope']['#uri']);

  this.emitStmt(n);
  this.smSetSrc_i(nc);

  own.used || this.grmif(own);
};
