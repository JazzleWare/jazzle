  import {ASSERT} from '../other/constants.js';
  import {cls} from './ctor.js';

cls.releaseTemp =
function(t) {
  ASSERT.call(this, t.occupied, 'unoccupied temp');
  t.occupied = 0;

  this.tempStack.push(t);
  return t;
};
 
cls.saveInTemp =
function(expr, list) {
  var t = this.allocTemp();
  var tsave = this.synth_TempSave(t, expr);
  tsave && list.push(tsave);
  return t;
};

cls.createTemp =
function() {
  var liq = this.cur.scs.gocLG('<t>').newL();
  liq.name = 't';
  return this.synth_Temp(liq);
};

cls.allocTemp =
function() { 
  var t = null;
  if (this.tempStack.length !== 0)
    t = this.tempStack.pop();
  else 
    t = this.createTemp();

  ASSERT.call(this, t.occupied === 0, 'occupied temp');
  t.occupied = 1;

  t.liq.track(this.cur);

  return t;
};


