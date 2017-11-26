  import {Emitters} from '../other/globals.js';
  import {wcb_afterStmt} from '../other/wcb.js';
  import {cls} from './ctor.js';

Emitters['#Bundler'] =
function(n, flags, isStmt) {
  return this.emitBundleItem(n.rootNode);
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

  this.emitStmt(n);

  own.used || this.grmif(own);
};


