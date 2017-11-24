  import {ASSERT} from '../other/constants.js';
  import Liquid from '../Liquid/cls.js';
  import Ref from '../Ref/cls.js';
  import {cls} from './cls.js';

this.getL =
function(idx) {
  return idx < this.list.length ?
    this.list[idx] : null;
};

this.seal = function() {
  ASSERT.call(this, !this.hasSeal, 'has seal');
  this.hasSeal = true;
  return this;
};

this.newL =
function() {
  ASSERT.call(this, !this.hasSeal, 'has seal');

  var liq = new Liquid(this.category);
  liq.r(new Ref(this.scope));
  liq.idx = this.length;
  this.list.push(liq);
  this.length = this.list.length;
  return liq;
};

