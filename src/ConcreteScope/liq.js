  import {_m} from '../other/scope-util.js';
  import {ASSERT} from '../other/constants.js';
  import LiquidGroup from '../LiquidGroup/cls.js';
  import {cls} from './cls.js';

this.gocLG =
function(gName) {
  var lg = this.getLG(gName);
  return lg || this.createLG(gName);
};

this.getLG =
function(gName) {
  var mname = _m(gName);
  if (this.liquidDefs.has(mname))
    return this.liquidDefs.get(mname);
  return null;
};

this.createLG =
function(gName) {
  var mname = _m(gName);
  ASSERT.call(this, this.getLG(gName) === null, 'LGr exists');
  var group = new LiquidGroup(gName);
  group.scope = this;
//group.newL();
  return this.liquidDefs.set(mname, group );
};

