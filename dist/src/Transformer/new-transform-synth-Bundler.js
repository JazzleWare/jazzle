  import {Transformers} from '../other/globals.js';
  import {cls} from './cls.js';

Transformers['#Bundler'] =
function(n, isVal) {
  var bs = n.bundleScope ;
  bs.synth_globals(this.renamer);
  n.rootNode = this.transformBundleItem(n.rootNode);

  var jzLG = bs.getLG('jz');
  if (jzLG)
    bs.synthLiquid(jzLG.getL(0));

  return n;
};

cls.transformBundleItem =
function(n) {
//n['#scope'].setSynthBase(this.bundleScope);
  var list = n['#imports'], len = list ? list.length : 0, l = 0;

  while (l < len) {
    list[l] =
      this.transformBundleItem(list[l]);
    l++;
  }

  return this.tr(n, false);
};


