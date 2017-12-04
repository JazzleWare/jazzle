import {ASSERT} from   '../other/constants.js';
import {Emitters} from '../other/globals.js';
import {wcb_afterStmt} from '../other/wcb.js';

import {cls} from './cls.js';
Emitters['#Bundler'] =
function(n, flags, isStmt) {
  var w = this.allow.jzWrapper /* && this.jzHelpers.active.length() > 0 */;

  if (this.jzLiquid === null) {
    var lg = n.bundleScope.getLG('jz');
    if (lg)
      this.jzLiquid = lg.getL(0);
    if (w)
      w = !!this.jzLiquid;
  }

  if (w) {
    this.wm('(','function','(', this.jzLiquid.synthName,')','{').l();
    this.allow.jzWrapper = false;
  }

  this.emitBundleItem(n.rootNode);

  if (w) {
    this.l().wm('}','(').writeJZHelpers();
    this.wm(')',')',';');
  }
};

cls.emitRenamed =
function(scope, total) {
  var list = scope.renamedHoisted, l = 0;
  while (l < list.length) {
    var item = list[l];
    switch (item.type) {
    case '#ExportDefaultDeclaration':
      ASSERT.call(this, item['#emitted'] === false, 'emitted');
      this.emitStmt(item);
      this.l();
      break;
    case '#Untransformed':
      ASSERT.call(this, item.kind === 'transformed-fn', 'hoisted ['+item.kind+']');
      if (!item.emitted) {
        this.emitSingleFun(item, true, 0, total>0);
        item.emitted = true;
      }
      break;
    default:
      ASSERT.call(this, 'rename hoisted is unknown: '+n.type);
    }
    ++l; 
  }

  scope.renamedHoisted = null;
  return l;
};
 
cls.emitBundleItem =
function(n) {
  var list = n['#scope'].allImportedScopes, len = list.length(), l = 0;
  var total = 0;
  while (l < len) {
    var scope = list.at(l++);
    if (scope.renamedHoisted) {
      total += this.emitRenamed(scope, total);
      scope.renamedHoisted = null;
    }
  }

  list = n['#imports'], len = list === null ? 0 : list.length, l = 0;
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
